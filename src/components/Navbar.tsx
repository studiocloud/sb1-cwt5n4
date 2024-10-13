import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, Package, ShoppingCart, LogOut, Bolt, User, Menu } from 'lucide-react';
import { Button } from "./ui/button"

const Navbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return null;
  }

  const NavButton = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Link to={to}>
      <Button variant={isActive(to) ? "default" : "ghost"} className="w-full justify-start">
        {icon}
        <span className="ml-2">{children}</span>
      </Button>
    </Link>
  );

  return (
    <nav className="bg-background text-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-foreground">
          <Bolt className="w-8 h-8" />
        </Link>
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {user ? (
          <div className="hidden md:flex space-x-2">
            <NavButton to="/" icon={<BarChart2 className="mr-2 h-4 w-4" />}>Dashboard</NavButton>
            <NavButton to="/inventory" icon={<Package className="mr-2 h-4 w-4" />}>Inventory</NavButton>
            <NavButton to="/sales" icon={<ShoppingCart className="mr-2 h-4 w-4" />}>Sales</NavButton>
            <NavButton to="/account" icon={<User className="mr-2 h-4 w-4" />}>Account</NavButton>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex space-x-2">
            <NavButton to="/login" icon={<LogOut className="mr-2 h-4 w-4" />}>Login</NavButton>
            <NavButton to="/register" icon={<User className="mr-2 h-4 w-4" />}>Register</NavButton>
          </div>
        )}
      </div>
      {isMenuOpen && (
        <div className="md:hidden shadow-lg">
          {user ? (
            <div className="flex flex-col space-y-2 p-4 bg-background">
              <NavButton to="/" icon={<BarChart2 className="mr-2 h-4 w-4" />}>Dashboard</NavButton>
              <NavButton to="/inventory" icon={<Package className="mr-2 h-4 w-4" />}>Inventory</NavButton>
              <NavButton to="/sales" icon={<ShoppingCart className="mr-2 h-4 w-4" />}>Sales</NavButton>
              <NavButton to="/account" icon={<User className="mr-2 h-4 w-4" />}>Account</NavButton>
              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 p-4 bg-background">
              <NavButton to="/login" icon={<LogOut className="mr-2 h-4 w-4" />}>Login</NavButton>
              <NavButton to="/register" icon={<User className="mr-2 h-4 w-4" />}>Register</NavButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;