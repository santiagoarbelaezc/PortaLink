import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizerService {
  private cache = new Map<string, string>();
  private inProgress = new Map<string, Subject<string>>();

  /**
   * Optimiza una imagen a partir de su URL o ruta en el navegador,
   * reduciendo su resolución máxima y calidad (por defecto 0.75 / 75%)
   * y convirtiéndola al formato ligero WebP.
   * @param src Ruta de la imagen (ej. 'assets/images/fotos/link-principal.jpg')
   * @param maxWidth Ancho máximo permitido en píxeles (por defecto 1200)
   * @param quality Calidad de compresión entre 0 y 1 (por defecto 0.75)
   * @param format Formato de salida deseado (por defecto 'image/webp')
   */
  optimize(
    src: string,
    maxWidth: number = 1200,
    quality: number = 0.75,
    format: 'image/webp' | 'image/jpeg' = 'image/webp'
  ): Observable<string> {
    if (!src || typeof window === 'undefined' || typeof document === 'undefined') {
      return of(src);
    }

    // Si ya es un data URL pequeño o SVG, retornar directamente
    if (src.startsWith('data:') && !src.startsWith('data:image/jpeg') && !src.startsWith('data:image/png')) {
      return of(src);
    }

    const cacheKey = `${src}_${maxWidth}_${quality}_${format}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    // Si ya se está optimizando esta imagen, suscribirse al proceso en curso
    if (this.inProgress.has(cacheKey)) {
      return this.inProgress.get(cacheKey)!.asObservable();
    }

    const subject = new Subject<string>();
    this.inProgress.set(cacheKey, subject);

    const img = new Image();
    // Prevenir errores de tainting si es posible
    if (src.startsWith('http') && !src.includes(window.location.host)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.finishOptimization(cacheKey, src, subject);
          return;
        }

        // Mejorar calidad del escalado en el canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let optimizedUrl = canvas.toDataURL(format, quality);
        // Si el navegador no soporta WebP y devolvió PNG por defecto, intentar con JPEG
        if (format === 'image/webp' && !optimizedUrl.startsWith('data:image/webp')) {
          optimizedUrl = canvas.toDataURL('image/jpeg', quality);
        }

        this.cache.set(cacheKey, optimizedUrl);
        this.finishOptimization(cacheKey, optimizedUrl, subject);
      } catch (e) {
        console.warn('ImageOptimizerService: Error al optimizar en canvas, usando original.', src, e);
        this.finishOptimization(cacheKey, src, subject);
      }
    };

    img.onerror = () => {
      // Si falla por CORS o red, devolver la ruta original como fallback
      this.finishOptimization(cacheKey, src, subject);
    };

    img.src = src;
    return subject.asObservable();
  }

  private finishOptimization(cacheKey: string, resultUrl: string, subject: Subject<string>): void {
    this.inProgress.delete(cacheKey);
    subject.next(resultUrl);
    subject.complete();
  }

  /**
   * Obtiene la versión optimizada de la caché si existe, o retorna la original
   * disparando la optimización en segundo plano para la próxima vez.
   */
  getCachedOrOriginal(
    src: string,
    maxWidth: number = 1200,
    quality: number = 0.75,
    format: 'image/webp' | 'image/jpeg' = 'image/webp'
  ): string {
    if (!src || typeof window === 'undefined') return src;
    const cacheKey = `${src}_${maxWidth}_${quality}_${format}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    // Disparar en segundo plano para cachearlo
    this.optimize(src, maxWidth, quality, format).subscribe();
    return src;
  }

  /**
   * Precarga y optimiza una lista de URLs de imágenes en segundo plano.
   */
  preloadAndOptimize(
    sources: string[],
    maxWidth: number = 1200,
    quality: number = 0.75
  ): void {
    if (typeof window === 'undefined' || !sources?.length) return;
    sources.forEach((src) => {
      if (src) {
        this.optimize(src, maxWidth, quality).subscribe();
      }
    });
  }

  /**
   * Optimiza un archivo File de imagen (ideal para formularios de subida de imágenes
   * en Cloudinary o Backend), reduciendo peso y resolución antes del upload.
   */
  async optimizeFile(
    file: File,
    maxWidth: number = 1200,
    quality: number = 0.75
  ): Promise<File> {
    if (!file || !file.type.startsWith('image/') || typeof window === 'undefined') {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const targetType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // Si la compresión no redujo el tamaño, mantener el archivo original
              resolve(file);
            } else {
              const optimizedFile = new File([blob], file.name, {
                type: blob.type,
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            }
          },
          targetType,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }

  /**
   * Limpia la caché en memoria de imágenes optimizadas.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
