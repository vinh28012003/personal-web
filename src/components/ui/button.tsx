import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  [
    // Touch target floor: 48px tall, 44px wide, comfortably past the 24x24 gate.
    "inline-flex items-center justify-center gap-2",
    "min-h-12 min-w-11 px-5 py-3",
    "font-mono text-xs tracking-[0.14em] uppercase font-bold",
    "border-4 border-rule cursor-pointer select-none",
    // 0ms feedback. The slab slams into its own shadow — transform only,
    // so this contributes exactly zero CLS.
    "transition-none",
    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        /** The ONE primary CTA per screen. Accent as a fill: 5.54:1. */
        primary:
          "bg-accent text-accent-fg shadow-slab hover:bg-on-ground hover:text-ground",
        // text-on-ground, not text-ink: inside an inverted block `ink` is the
        // background colour, which rendered this button invisible.
        secondary:
          "bg-transparent text-on-ground shadow-slab hover:bg-on-ground hover:text-ground",
        /** No border, no shadow — for tertiary inline actions. */
        ghost:
          "border-0 min-h-11 px-2 text-accent-text underline underline-offset-4 hover:bg-accent hover:text-accent-fg hover:no-underline",
      },
      size: {
        md: "",
        lg: "min-h-14 px-7 text-sm",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof button>;

interface ButtonProps extends ButtonVariants {
  href?: string;
  children: React.ReactNode;
  className?: string;
  download?: boolean | string;
  type?: "button" | "submit";
  onClick?: () => void;
  "aria-label"?: string;
}

/** Opens in a new tab: real http(s) links to another origin. */
const isExternal = (href: string) => /^(https?:)?\/\//.test(href);

/**
 * Anything the client router must not handle. mailto:, tel:, sms: and
 * friends are not routes — passing them to next/link produces a link that
 * silently fails to do anything.
 */
const isNonRouted = (href: string) =>
  isExternal(href) || /^[a-z][a-z0-9+.-]*:/i.test(href);

/**
 * Renders next/link for internal hrefs, a plain anchor for external ones
 * (with an sr-only "opens in new tab" so the behaviour is announced, not
 * just implied by an icon), and a real button when there is no href.
 */
export function Button({
  href,
  variant,
  size,
  className,
  children,
  download,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(button({ variant, size }), className);

  if (href && (isNonRouted(href) || download)) {
    return (
      <a
        href={href}
        className={classes}
        download={download}
        {...(isExternal(href) && { target: "_blank", rel: "noreferrer" })}
        {...props}
      >
        {children}
        {isExternal(href) && (
          <span className="sr-only"> (opens in new tab)</span>
        )}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
