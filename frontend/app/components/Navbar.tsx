"use client";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import Link from "next/link";
import { changeAuthStatus } from "../redux/reducer/auth";
const Navbar: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  return (
    <nav className="bg-white shadow-md py-5 border-b-[1px] border-black-100">
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-gray-800 cursor-pointer">
            DeployCloud
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/contact">
            <div className="text-gray-800 cursor-pointer">Contact</div>
          </Link>
          {isAuthenticated ? (
            <Link href="/signin">
              <div
                className="px-4 py-2 bg-black text-white rounded-md cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("token");
                  dispatch(changeAuthStatus(false));
                }}
              >
                Logout
              </div>
            </Link>
          ) : (
            <>
              <Link href="/signin">
                <div className="text-gray-800 cursor-pointer">Login</div>
              </Link>
              <Link href="/signup">
                <div className="bg-black text-white py-2 px-4 rounded-md cursor-pointer">
                  Sign Up
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
