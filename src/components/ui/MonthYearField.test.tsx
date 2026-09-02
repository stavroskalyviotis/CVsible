import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthYearField } from "./MonthYearField";

describe("MonthYearField", () => {
  it("shows the placeholder when empty, and a formatted value once set", () => {
    const { rerender } = render(
      <MonthYearField label="Start" value="" onChange={() => {}} locale="en" placeholder="—" />,
    );
    expect(screen.getByRole("button", { name: "—" })).toBeInTheDocument();

    rerender(<MonthYearField label="Start" value="2022-03" onChange={() => {}} locale="en" placeholder="—" />);
    expect(screen.getByRole("button")).toHaveTextContent(/Mar 2022/);
  });

  it("drills down decade -> year -> month and reports YYYY-MM on pick", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MonthYearField label="Start" value="" onChange={onChange} locale="en" />);

    await user.click(screen.getByRole("button", { name: "—" }));
    await user.click(screen.getByRole("button", { name: "2020" }));
    await user.click(screen.getByRole("button", { name: "2022" }));
    await user.click(screen.getByRole("button", { name: "Mar" }));

    expect(onChange).toHaveBeenCalledWith("2022-03");
  });

  it("jumps straight to the year screen when a minValue is given and no value is set yet", async () => {
    const user = userEvent.setup();
    render(<MonthYearField label="End" value="" onChange={() => {}} locale="en" minValue="2022-06" />);

    await user.click(screen.getByRole("button", { name: "—" }));
    // The popover header reads "2020s" only once past the decade-picker screen.
    expect(screen.getByText("2020s")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2022" })).toBeEnabled();
  });

  it("disables years before minValue's year", async () => {
    const user = userEvent.setup();
    render(<MonthYearField label="End" value="" onChange={() => {}} locale="en" minValue="2022-06" />);
    await user.click(screen.getByRole("button", { name: "—" }));
    expect(screen.getByRole("button", { name: "2021" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2022" })).toBeEnabled();
  });

  it("disables months before minValue's month, in minValue's year", async () => {
    const user = userEvent.setup();
    render(<MonthYearField label="End" value="" onChange={() => {}} locale="en" minValue="2022-06" />);
    await user.click(screen.getByRole("button", { name: "—" }));
    await user.click(screen.getByRole("button", { name: "2022" }));
    expect(screen.getByRole("button", { name: "May" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Jun" })).toBeEnabled();
  });

  it("does not disable months in a later year even if before minValue's month number", async () => {
    const user = userEvent.setup();
    render(<MonthYearField label="End" value="" onChange={() => {}} locale="en" minValue="2022-06" />);
    await user.click(screen.getByRole("button", { name: "—" }));
    await user.click(screen.getByRole("button", { name: "2023" }));
    expect(screen.getByRole("button", { name: "Jan" })).toBeEnabled();
  });

  it("shows the min-value hint message when provided", async () => {
    const user = userEvent.setup();
    render(
      <MonthYearField
        label="End"
        value=""
        onChange={() => {}}
        locale="en"
        minValue="2022-06"
        minValueMessage="Must be after the start date"
      />,
    );
    await user.click(screen.getByRole("button", { name: "—" }));
    expect(screen.getByText("Must be after the start date")).toBeInTheDocument();
  });

  it("does not open the picker while disabled", async () => {
    const user = userEvent.setup();
    render(<MonthYearField label="Start" value="" onChange={() => {}} locale="en" disabled placeholder="—" />);
    await user.click(screen.getByRole("button", { name: "—" }));
    expect(screen.queryByRole("button", { name: "2020" })).not.toBeInTheDocument();
  });

  it("closes when clicking outside the field", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <MonthYearField label="Start" value="" onChange={() => {}} locale="en" placeholder="—" />
        <button type="button">outside</button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "—" }));
    expect(screen.getByRole("button", { name: "2020" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("button", { name: "2020" })).not.toBeInTheDocument();
  });
});
