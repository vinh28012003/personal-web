import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * next/link needs App Router context that jsdom has no reason to provide.
 * We only assert which ELEMENT the Button renders and with what attributes,
 * so a passthrough anchor is the right level of mock: it keeps the boundary
 * (routing) out of a unit test without hiding the behaviour under test.
 */
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-next-link="true" {...props}>
      {children}
    </a>
  ),
}));
