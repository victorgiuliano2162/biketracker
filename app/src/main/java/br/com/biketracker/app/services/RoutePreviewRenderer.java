package br.com.biketracker.app.services;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.LineString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Path2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Renders a PNG map preview for a route's JTS LineString using Web Mercator
 * projection, optional OpenStreetMap tile compositing, and Java 2D vector drawing.
 */
public final class RoutePreviewRenderer {

    private static final Logger log = LoggerFactory.getLogger(RoutePreviewRenderer.class);

    private static final int WIDTH = 640;
    private static final int HEIGHT = 360;
    private static final int TILE_SIZE = 256;
    private static final double PADDING_RATIO = 0.14;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    private RoutePreviewRenderer() {}

    public static byte[] renderPng(LineString path) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

            drawCartographicBackground(g);

            if (path != null && path.getNumPoints() >= 2) {
                Coordinate[] coords = path.getCoordinates();
                Viewport viewport = computeViewport(coords);
                drawOsmTiles(g, viewport);
                drawRoutePath(g, coords, viewport);
            }
        } finally {
            g.dispose();
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao codificar preview PNG", e);
        }
    }

    private static void drawCartographicBackground(Graphics2D g) {
        g.setColor(new Color(0xF4, 0xF4, 0xF5));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        g.setColor(new Color(0xE4, 0xE4, 0xE7));
        g.setStroke(new BasicStroke(1f));
        for (int x = 32; x < WIDTH; x += 32) {
            g.drawLine(x, 0, x, HEIGHT);
        }
        for (int y = 32; y < HEIGHT; y += 32) {
            g.drawLine(0, y, WIDTH, y);
        }
    }

    private static Viewport computeViewport(Coordinate[] coords) {
        double minLon = Double.MAX_VALUE, maxLon = -Double.MAX_VALUE;
        double minLat = Double.MAX_VALUE, maxLat = -Double.MAX_VALUE;

        for (Coordinate c : coords) {
            if (c.x < minLon) minLon = c.x;
            if (c.x > maxLon) maxLon = c.x;
            if (c.y < minLat) minLat = c.y;
            if (c.y > maxLat) maxLat = c.y;
        }

        double centerLon = (minLon + maxLon) / 2.0;
        double centerLat = (minLat + maxLat) / 2.0;

        int usableW = (int) (WIDTH * (1.0 - 2.0 * PADDING_RATIO));
        int usableH = (int) (HEIGHT * (1.0 - 2.0 * PADDING_RATIO));

        int chosenZoom = 13;
        for (int z = 16; z >= 2; z--) {
            double x1 = lonToPixelX(minLon, z);
            double x2 = lonToPixelX(maxLon, z);
            double y1 = latToPixelY(maxLat, z);
            double y2 = latToPixelY(minLat, z);
            if (Math.abs(x2 - x1) <= usableW && Math.abs(y2 - y1) <= usableH) {
                chosenZoom = z;
                break;
            }
        }

        double centerPx = lonToPixelX(centerLon, chosenZoom);
        double centerPy = latToPixelY(centerLat, chosenZoom);
        return new Viewport(chosenZoom, centerPx - WIDTH / 2.0, centerPy - HEIGHT / 2.0);
    }

    private static void drawOsmTiles(Graphics2D g, Viewport vp) {
        int minTileX = (int) Math.floor(vp.originX / TILE_SIZE);
        int maxTileX = (int) Math.floor((vp.originX + WIDTH) / TILE_SIZE);
        int minTileY = (int) Math.floor(vp.originY / TILE_SIZE);
        int maxTileY = (int) Math.floor((vp.originY + HEIGHT) / TILE_SIZE);
        int maxIndex = (1 << vp.zoom);

        List<CompletableFuture<TileResult>> futures = new ArrayList<>();
        for (int tx = minTileX; tx <= maxTileX; tx++) {
            for (int ty = minTileY; ty <= maxTileY; ty++) {
                if (ty < 0 || ty >= maxIndex) continue;
                int wrappedX = ((tx % maxIndex) + maxIndex) % maxIndex;
                int drawX = (int) Math.round(tx * TILE_SIZE - vp.originX);
                int drawY = (int) Math.round(ty * TILE_SIZE - vp.originY);
                futures.add(fetchTileAsync(vp.zoom, wrappedX, ty, drawX, drawY));
            }
        }

        for (CompletableFuture<TileResult> future : futures) {
            try {
                TileResult tile = future.join();
                if (tile != null && tile.image != null) {
                    g.drawImage(tile.image, tile.drawX, tile.drawY, TILE_SIZE, TILE_SIZE, null);
                }
            } catch (Exception ignored) {
                // Keep cartographic grid fallback if a tile fails
            }
        }
    }

    private static CompletableFuture<TileResult> fetchTileAsync(int z, int x, int y, int drawX, int drawY) {
        String url = String.format("https://tile.openstreetmap.org/%d/%d/%d.png", z, x, y);
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(3))
                .header("User-Agent", "BiketrackerPreview/1.0")
                .GET()
                .build();

        return HTTP_CLIENT.sendAsync(req, HttpResponse.BodyHandlers.ofByteArray())
                .thenApply(res -> {
                    if (res.statusCode() == 200) {
                        try (ByteArrayInputStream bais = new ByteArrayInputStream(res.body())) {
                            return new TileResult(ImageIO.read(bais), drawX, drawY);
                        } catch (Exception e) {
                            return null;
                        }
                    }
                    return null;
                })
                .exceptionally(ex -> {
                    log.debug("Tile OSM indisponível ({}/{}/{}): {}", z, x, y, ex.getMessage());
                    return null;
                });
    }

    private static void drawRoutePath(Graphics2D g, Coordinate[] coords, Viewport vp) {
        Path2D.Double poly = new Path2D.Double();
        double startX = 0, startY = 0, endX = 0, endY = 0;

        for (int i = 0; i < coords.length; i++) {
            double px = lonToPixelX(coords[i].x, vp.zoom) - vp.originX;
            double py = latToPixelY(coords[i].y, vp.zoom) - vp.originY;
            if (i == 0) {
                poly.moveTo(px, py);
                startX = px;
                startY = py;
            } else {
                poly.lineTo(px, py);
            }
            if (i == coords.length - 1) {
                endX = px;
                endY = py;
            }
        }

        // White halo casing for contrast over map tiles
        g.setColor(new Color(255, 255, 255, 230));
        g.setStroke(new BasicStroke(6.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.draw(poly);

        // Primary Alpine Cartography emerald route line
        g.setColor(new Color(0x1B, 0x6B, 0x53));
        g.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.draw(poly);

        // Start & end markers
        drawMarker(g, startX, startY, new Color(0x1B, 0x6B, 0x53));
        drawMarker(g, endX, endY, new Color(0xDC, 0x26, 0x26));
    }

    private static void drawMarker(Graphics2D g, double x, double y, Color fill) {
        double rOuter = 6.0;
        double rInner = 3.8;
        g.setColor(Color.WHITE);
        g.fill(new Ellipse2D.Double(x - rOuter, y - rOuter, rOuter * 2, rOuter * 2));
        g.setColor(fill);
        g.fill(new Ellipse2D.Double(x - rInner, y - rInner, rInner * 2, rInner * 2));
    }

    private static double lonToPixelX(double lon, int zoom) {
        return (lon + 180.0) / 360.0 * TILE_SIZE * (1 << zoom);
    }

    private static double latToPixelY(double lat, int zoom) {
        double clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
        double sinLat = Math.sin(Math.toRadians(clamped));
        return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * TILE_SIZE * (1 << zoom);
    }

    private record Viewport(int zoom, double originX, double originY) {}

    private record TileResult(BufferedImage image, int drawX, int drawY) {}
}
