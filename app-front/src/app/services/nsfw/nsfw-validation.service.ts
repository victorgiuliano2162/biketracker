import { Injectable } from '@angular/core';

export interface NsfwResult {
  blocked: boolean;
  reason?: string;
}

interface NsfwPrediction {
  className: string;
  probability: number;
}

// Threshold permissivo — só bloqueia com alta certeza
const BLOCK_THRESHOLD = 0.7;
const PORN_THRESHOLD_COMBINED = 0.99;  // Porn + Sexy somados
const PORN_THRESHOLD_ALONE    = 0.60;  // Porn isolado
const HENTAI_THRESHOLD        = 0.75;  // Hentai isolado
const BLOCKED_CLASSES = ['Porn', 'Hentai', 'Sexy'];

@Injectable({
  providedIn: 'root',
})
export class NsfwValidationService {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any = null;
  private loading = false;
  private readyPromise: Promise<void> | null = null;

  /**
   * Carrega o modelo NSFWJS + TensorFlow.js de forma lazy.
   * A segunda chamada reutiliza a mesma Promise — o modelo só é baixado uma vez.
   */
  private async ensureModel(): Promise<void> {
    if (this.model) return;

    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.loading = true;
    this.readyPromise = (async () => {
      // Dynamic imports — só entram no bundle quando este método é chamado
      const [tf, nsfwjs] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('nsfwjs'),
      ]);

      // Garante que o backend WebGL seja inicializado
      await tf.ready();

      // Modelo hospedado pela própria biblioteca (InceptionV3 quantizado ~10 MB)
      this.model = await nsfwjs.load();
      this.loading = false;
    })();

    return this.readyPromise;
  }

  /**
   * Analisa um File de imagem e retorna se deve ser bloqueado.
   *
   * @param file - Arquivo de imagem já validado quanto a tipo/tamanho
   * @returns NsfwResult com `blocked: true` e `reason` se reprovado
   */
  async classify(file: File): Promise<NsfwResult> {
    await this.ensureModel();
    console.log('[NSFW] Modelo carregado, classificando...');
 
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
 
      img.onload = async () => {
        try {
          const predictions: NsfwPrediction[] = await this.model.classify(img);
          console.log('[NSFW] Predictions:', predictions); // remova após validar
 
          const get = (name: string): number =>
            predictions.find((p) => p.className === name)?.probability ?? 0;
 
          const porn   = get('Porn');
          const sexy   = get('Sexy');
          const hentai = get('Hentai');
 
          const combinedExplicit = porn + sexy;
 
          let reason: string | undefined;
 
          if (hentai >= HENTAI_THRESHOLD) {
            reason = `Conteúdo impróprio detectado (Hentai: ${(hentai * 100).toFixed(0)}%).`;
          } else if (porn >= PORN_THRESHOLD_ALONE) {
            reason = `Conteúdo impróprio detectado (${(porn * 100).toFixed(0)}% de certeza).`;
          } else if (combinedExplicit >= PORN_THRESHOLD_COMBINED) {
            reason = `Conteúdo impróprio detectado (${(combinedExplicit * 100).toFixed(0)}% de certeza).`;
          }
 
          resolve(reason ? { blocked: true, reason } : { blocked: false });
 
        } catch (err) {
          console.error('[NSFW] Erro no classify:', err);
          // Em caso de erro no modelo, deixa passar (fail-open)
          resolve({ blocked: false });
        } finally {
          URL.revokeObjectURL(url);
        }
      };
 
      img.onerror = (err) => {
        console.error('[NSFW] Erro ao carregar imagem:', err);
        URL.revokeObjectURL(url);
        resolve({ blocked: false });
      };
 
      img.src = url;
    });
  }
 

  get isLoading(): boolean {
    return this.loading;
  }
}
