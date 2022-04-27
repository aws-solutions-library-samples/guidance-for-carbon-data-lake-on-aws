import React from "react";

//  Icons
// Icon used in company branding section of sidebar
import { SiAmazonaws} from 'react-icons/si';

// Styled Components
import {
  CompanyBrandingWrapper,
  CompanyBrandingContainer,
  Icon
} from "./CompanyBranding.styles";
import { Text } from './CompanyBranding.styles';
import { Link } from 'react-router-dom'

let CompanyName = 'CarbonLake'
const CompanyBranding = () => {
  return(
    <>
    <CompanyBrandingWrapper>
      <CompanyBrandingContainer>
        <Link to ='/dashboard'>
          <Icon>
            <SiAmazonaws/>
          </Icon>
        </Link>
        <Link to ='/dashboard'>
            <Text>
              <span> {CompanyName}</span>
            </Text>
        </Link>
      </CompanyBrandingContainer>
    </CompanyBrandingWrapper>
        </>
  )
}

export default  CompanyBranding;
