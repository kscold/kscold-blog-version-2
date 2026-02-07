export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-7xl font-serif font-bold text-primary-900 dark:text-primary-50">
          안녕하세요,
          <br />
          <span className="text-gradient">김승찬</span>입니다.
        </h1>
        <p className="text-xl text-primary-600 dark:text-primary-400 font-light">
          프론트엔드 개발자 / 기술 블로거
        </p>
        <button className="glass-card px-8 py-4 text-lg font-medium hover:scale-105 transition-transform">
          블로그 둘러보기
        </button>
      </div>
    </main>
  );
}
