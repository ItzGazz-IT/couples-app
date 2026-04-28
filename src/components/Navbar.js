import { NavLink } from "react-router-dom";

function Navbar() {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/transactions", label: "Activity" },
    { to: "/goals", label: "Goals" },
    { to: "/bills", label: "Bills" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            isActive ? "bottom-link bottom-link-active" : "bottom-link"
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;