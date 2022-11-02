import React, { FC, useState, useCallback } from 'react';
// @todo replace with mapDispatch & mapState to props
import { useDispatch, useSelector } from 'react-redux';

import { switchAccount } from '../../../redux/actions/account';
import { selectAccountSlice } from '../../../redux/slices/account';
import { selectFlowLimitationSubMenu } from '../../../redux/slices/flowLimitation';
import AccountMenu from '../../../shared/ui/core/AccountMenu';
import UserAccount from '../../../shared/ui/core/UserAccount';
import { StyledMain, StyledTop, StyledAccount } from './ui';

type MainProps = {
    children: React.ReactChildren;
    history: {
        location: {
            pathname: string;
        };
    };
};

const Main: FC<MainProps> = ({ children }) => {
    const dispatch = useDispatch();
    const { accountId, accountsBalance, localStorage } = useSelector(selectAccountSlice);
    const flowLimitationSubMenu = useSelector(selectFlowLimitationSubMenu);

    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

    const selectAccount = useCallback((accountId) => {
        dispatch(switchAccount({ accountId }));
    }, []);

    const handleSelectAccount = useCallback((accountId) => {
        selectAccount(accountId);
        setIsMenuVisible(false);
    }, []);

    return (
        <StyledMain>
            <StyledTop>
                <StyledAccount>
                    <UserAccount
                        accountId={accountId || localStorage?.accountId}
                        onClick={toggleMenu}
                        flowLimitationSubMenu={flowLimitationSubMenu}
                        withIcon
                    />
                    <AccountMenu
                        show={localStorage?.accountFound && isMenuVisible}
                        handleSelectAccount={handleSelectAccount}
                        accountIdLocalStorage={localStorage?.accountId}
                        accountsBalance={accountsBalance}
                        setIsAccountMenuVisible={setIsMenuVisible}
                    />
                </StyledAccount>
            </StyledTop>

            {children}
        </StyledMain>
    );
};

export default Main;
