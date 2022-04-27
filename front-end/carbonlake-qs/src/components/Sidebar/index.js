import React from 'react';

// Styled Components
import { Nav, Container } from './Sidebar.styles';
import CompanyBranding from './CompanyBranding';
import UserProfile from './UserProfile';
import NavLinks from './NavLinks';
import UserLogout from './NavLinks/UserLogout';

const Sidebar = () => {
  return (
    <Nav  id="navbar">
      <Container>
        <CompanyBranding />
        <UserProfile />
        <NavLinks />
        {/* May remove this component and use logout in "Account" dropdown */}
        {/* <UserLogout /> */}
      </Container>
    </Nav>
  )
}

export default Sidebar;
