import React from "react";
import { render, screen } from "@testing-library/react";
import Login from "./pages/Login";
import Register from "./pages/Register";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

describe("Authentication Security Updates", () => {
  test("Login page does NOT render Quick Role Switcher or shortcut buttons", () => {
    render(<Login />);

    // Quick role switcher text should not exist
    expect(screen.queryByText(/Quick Role Switcher/i)).toBeNull();
    expect(screen.queryByText(/Evaluation Demos/i)).toBeNull();

    // Role shortcut buttons should not exist
    expect(screen.queryByRole("button", { name: /Student/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Owner/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Warden/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Admin/i })).toBeNull();

    // Normal login form elements must remain intact
    expect(screen.getByRole("heading", { name: /Sign In to Smart PG/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
  });

  test("Registration page role dropdown only contains Student, Owner, and Warden", () => {
    render(<Register />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);

    // Exactly 3 allowed roles
    expect(options).toEqual(["STUDENT", "OWNER", "WARDEN"]);

    // ADMIN must not be an option
    expect(options).not.toContain("ADMIN");
  });
});
