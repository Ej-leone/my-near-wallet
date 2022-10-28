import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import DesktopContainer from './DesktopContainer';
import MobileContainer from './MobileContainer';

const Container = styled.div`
    &&& {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        border-right: 1px solid #c9d0d9;

        @media (max-width: 991px) {
            bottom: ${(props) => props.open ? '0' : 'unset'};
        }

        h6 {
            font-size: 13px;
            margin-bottom: 5px;
            color: #72727A;
            font-weight: normal;
        }

        .account-selector {
            padding: 0;
            box-shadow: none;
            border-radius: 0;
        }
    }
`;

const Navigation = ({
    selectAccount,
    showNavLinks,
    flowLimitationMainMenu,
    flowLimitationSubMenu,
    refreshBalance,
    availableAccounts,
    account
}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (menuOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('click', handleClick);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClick);
        }
    }, [menuOpen]);

    const handleKeyDown = useCallback((e) => {
        if (e.keyCode === 27) {
            setMenuOpen(false);
        }
    }, []);

    const handleClick = useCallback((e) => {
        const desktopMenu = document.getElementById('desktop-menu');
        const mobileMenu = document.getElementById('mobile-menu');

        if (e.target.tagName === 'SPAN') {
            return false;
        }

        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || (!desktopMenu?.contains(e.target) && !mobileMenu?.contains(e.target))) {
            setMenuOpen(false);
        }
    }, []);

    const toggleMenu = useCallback(() => {
        if (menuOpen) {
            setMenuOpen(false);
        } else {
            setMenuOpen(true);
        }
    }, [menuOpen]);

    const handleSelectAccount = useCallback((accountId) => {
        selectAccount(accountId);
        setMenuOpen(false);
    }, []);

    return (
        <Container id='nav-container' open={menuOpen}>
            <DesktopContainer
                menuOpen={menuOpen}
                toggleMenu={toggleMenu}
                handleSelectAccount={handleSelectAccount}
                showNavLinks={showNavLinks}
                flowLimitationMainMenu={flowLimitationMainMenu}
                flowLimitationSubMenu={flowLimitationSubMenu}   
                refreshBalance={refreshBalance}
                availableAccounts={availableAccounts}
                account={account}
            />
            <MobileContainer
                menuOpen={menuOpen}
                toggleMenu={toggleMenu}
                handleSelectAccount={handleSelectAccount}
                showNavLinks={showNavLinks}
                flowLimitationMainMenu={flowLimitationMainMenu}
                flowLimitationSubMenu={flowLimitationSubMenu}   
                refreshBalance={refreshBalance}
                availableAccounts={availableAccounts}
                account={account}
            />
        </Container>
    );
};

export default Navigation;
