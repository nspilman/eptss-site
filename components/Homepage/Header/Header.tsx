import Link from "next/link";
import React, { ReactElement } from "react";
import { useGetSignupLink } from "../../../hooks/useGetSignupLink";

const learnMoreLink = "/everyone-plays-the-same-song";

export const Header = (): ReactElement => {
  const signupLink = useGetSignupLink();
  return (
    <header id="header">
      <div className="menu-wrap">
        <input type="checkbox" className="toggler" />
        <div className="hamburger">
          <div></div>
        </div>
        <div className="menu">
          <div>
            <div>
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href={learnMoreLink}>Learn More</Link>
                </li>
                <li>
                  <Link href={signupLink}>Sign Up</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
