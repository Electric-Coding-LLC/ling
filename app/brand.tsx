import Image from "next/image";

type BrandProps = {
  className?: string;
};

export function LingMark({ className }: BrandProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-brand="ling-four-stroke"
      viewBox="7 7 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 29V18C8 12.477 12.477 8 18 8h11v12h-9v9H8Z" />
      <path d="M35 8h11c5.523 0 10 4.477 10 10v11H44v-9h-9V8Z" />
      <path d="M56 35v11c0 5.523-4.477 10-10 10H35V44h9v-9h12Z" />
      <path d="M29 56H18C12.477 56 8 51.523 8 46V35h12v9h9v12Z" />
    </svg>
  );
}

export function LingWordmark({ className }: BrandProps) {
  return (
    <span className={className}>
      <LingMark className="brand-mark" />
      <Image
        alt="Ling"
        className="brand-name"
        height={253}
        src="/brand/ling-wordmark.svg"
        unoptimized
        width={524}
      />
    </span>
  );
}
