import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyEmail } from "@/components/ui/copy-email";

const EMAIL = "someone@example.com";

/**
 * Must run AFTER userEvent.setup(): setup installs its own
 * navigator.clipboard, so stubbing first is silently overwritten and the
 * component writes to userEvent's stub instead of this one.
 */
function stubClipboard(impl: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn(impl) },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => vi.useRealTimers());
afterEach(() => vi.restoreAllMocks());

describe("CopyEmail success path", () => {
  it("should_write_the_address_when_the_button_is_pressed", async () => {
    const user = userEvent.setup();
    stubClipboard(() => Promise.resolve());
    render(<CopyEmail email={EMAIL} />);

    await user.click(await screen.findByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(EMAIL);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(/copied/i),
    );
  });
});

describe("CopyEmail denial path", () => {
  // The regression this guards: a denied clipboard used to set state that
  // unmounted the button. The control the user had just pressed vanished,
  // silently, dropping focus to <body>.
  it("should_keep_the_button_mounted_when_the_clipboard_is_denied", async () => {
    const user = userEvent.setup();
    stubClipboard(() => Promise.reject(new Error("denied")));
    render(<CopyEmail email={EMAIL} />);

    const button = await screen.findByRole("button");
    await user.click(button);

    expect(button).toBeInTheDocument();
    expect(screen.getByRole("button")).toBe(button);
  });

  it("should_announce_the_failure_when_the_clipboard_is_denied", async () => {
    const user = userEvent.setup();
    stubClipboard(() => Promise.reject(new Error("denied")));
    render(<CopyEmail email={EMAIL} />);

    await user.click(await screen.findByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(/copy failed/i),
    );
  });

  it("should_point_at_the_mailto_when_the_clipboard_is_denied", async () => {
    const user = userEvent.setup();
    stubClipboard(() => Promise.reject(new Error("denied")));
    render(<CopyEmail email={EMAIL} />);

    await user.click(await screen.findByRole("button"));

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `mailto:${EMAIL}`);
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveAccessibleName(
        /use the email link/i,
      ),
    );
  });

  it("should_retry_when_pressed_again_after_a_denial", async () => {
    let attempt = 0;
    const user = userEvent.setup();
    stubClipboard(() => {
      attempt += 1;
      return attempt === 1
        ? Promise.reject(new Error("denied"))
        : Promise.resolve();
    });
    render(<CopyEmail email={EMAIL} />);

    const button = await screen.findByRole("button");
    await user.click(button);
    await user.click(button);

    expect(attempt).toBe(2);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(/copied/i),
    );
  });
});
