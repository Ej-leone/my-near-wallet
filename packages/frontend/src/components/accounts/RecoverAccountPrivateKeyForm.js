import React from 'react';
import { Translate } from 'react-localize-redux';

import classNames from '../../utils/classNames';
import FormButton from '../common/FormButton';

const RecoverAccountPrivateKeyForm = ({
    isLegit,
    handleChange,
    seedPhrase,
    localAlert,
    recoveringAccount,
    findMyAccountSending
}) => (
        <>
            <h4><Translate id='recoverPrivateKey.seedPhraseInput.title' /></h4>
            <Translate>
                {({ translate }) => (
                    <input
                        value={seedPhrase}
                        onChange={(e) => handleChange(e.target.value)}
                        className={classNames([{'success': localAlert && localAlert.success}, {'problem': localAlert && localAlert.success === false}])}
                        placeholder={translate('recoverPrivateKey.seedPhraseInput.placeholder')}
                        disabled={recoveringAccount}
                        data-test-id="privateKeyRecoveryInput"
                        required
                        tabIndex='2'
                        autoCapitalize='off'
                    />
                )}
            </Translate>
            <FormButton
                type='submit'
                color='blue'
                disabled={!isLegit || recoveringAccount}
                sending={findMyAccountSending}
                sendingString='button.recovering'
                data-test-id="privateKeyRecoverySubmitButton"
            >
                <Translate id='button.findMyAccount' />
            </FormButton>
        </>
);

export default RecoverAccountPrivateKeyForm;
