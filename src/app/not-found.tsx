import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <img src="/favicon.svg" alt="SINYAL" className="w-12 h-12 mx-auto mb-4" />
          <div className="text-8xl font-black bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
            404
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2">Sayfa Bulunamadi</h1>
        <p className="text-sm text-muted mb-6">
          Aradiginiz sayfa mevcut degil veya tasindi. Ana sayfaya donerek gunun maclarini inceleyebilirsiniz.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-xl font-medium text-sm hover:bg-accent-light transition-colors"
        >
          Ana Sayfaya Don
        </Link>
      </div>
    </div>
  );
}
