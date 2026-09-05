interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="mx-auto max-w-3xl p-10 text-center text-[var(--color-text-sub)]">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-1 text-sm">준비중입니다.</p>
    </div>
  );
}
