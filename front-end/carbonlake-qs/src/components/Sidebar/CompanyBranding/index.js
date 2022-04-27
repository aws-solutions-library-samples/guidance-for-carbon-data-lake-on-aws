import React from "react";

//  Icons
import { SiPytorchlightning } from 'react-icons/si';

// Styled Components
import {
  CompanyBrandingWrapper,
  CompanyBrandingContainer,
  Icon
} from "./CompanyBranding.styles";
import { Text } from './CompanyBranding.styles';
import { Link } from 'react-router-dom'

let CompanyName = 'Növęk Solar Ltd.'
const CompanyBranding = () => {
  return(
    <>
    <CompanyBrandingWrapper>
      <CompanyBrandingContainer>
        <Link to ='/dashboard'>
          <Icon>
            <SiPytorchlightning/>
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
