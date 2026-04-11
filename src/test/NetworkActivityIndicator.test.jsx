import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import NetworkActivityIndicator from "../components/NetworkActivityIndicator";
import { beginNetworkRequest, endNetworkRequest } from "../lib/networkActivity";

describe("NetworkActivityIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("appears only after short debounce for real waits", () => {
    render(<NetworkActivityIndicator />);

    act(() => beginNetworkRequest());
    expect(screen.queryByLabelText("Network activity")).not.toBeInTheDocument();

    // Fast responses should not flash any indicator.
    act(() => endNetworkRequest());
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.queryByLabelText("Network activity")).not.toBeInTheDocument();

    // Slow responses should show indicator after debounce.
    act(() => beginNetworkRequest());
    act(() => {
      vi.advanceTimersByTime(190);
    });
    expect(screen.getByLabelText("Network activity")).toBeInTheDocument();
  });
});
