import * as nearApi from 'near-api-js';

import {
    NEAR_ID,
    NEAR_TOKEN_ID,
    FT_MINIMUM_STORAGE_BALANCE,
    FT_STORAGE_DEPOSIT_GAS,
} from '../../config';
import { fungibleTokensService } from '../FungibleTokens';
import refFinanceContract from './RefFinanceContract';
import { isNearTransformation, replaceNearIfNecessary } from './utils';

class FungibleTokenExchange {
    _exchange;

    constructor(exchangeInstance) {
        this._exchange = exchangeInstance;
    }

    async getData({ account }) {
        return this._exchange.getData({ account });
    }

    async estimate(params) {
        if (isNearTransformation(params)) {
            return this._estimateNearSwap(params);
        }

        return this._estimateSwap(params);
    }

    async swap(params) {
        if (isNearTransformation(params)) {
            return this._transformNear(params);
        }

        const { account, poolId, tokenIn, tokenOut, amountIn, minAmountOut } = params;
        const {
            contractName: tokenInId,
            onChainFTMetadata: { decimals: tokenInDecimals },
        } = tokenIn;
        const {
            contractName: tokenOutId,
            onChainFTMetadata: { decimals: tokenOutDecimals },
        } = tokenOut;

        const swapParams = {
            account,
            poolId,
            tokenInId,
            tokenInDecimals,
            amountIn,
            tokenOutId,
            tokenOutDecimals,
            minAmountOut,
        };

        if (tokenInId === NEAR_ID) {
            return this._swapNearToToken(swapParams);
        }

        if (tokenInId === NEAR_TOKEN_ID) {
            return this._swapWNearToToken(swapParams);
        }

        if (tokenOutId === NEAR_ID) {
            return this._swapTokenToNear(swapParams);
        }

        if (tokenOutId === NEAR_TOKEN_ID) {
            return this._swapTokenToWNear(swapParams);
        }

        return this._swapTokenToToken(swapParams);
    }

    _estimateNearSwap(params) {
        return {
            amountOut: params.amountIn,
        };
    }

    async _estimateSwap(params) {
        const { tokenIn, tokenOut } = params;

        return this._exchange.estimate({
            ...params,
            tokenInId: replaceNearIfNecessary(tokenIn.contractName),
            tokenInDecimals: tokenIn.onChainFTMetadata.decimals,
            tokenOutId: replaceNearIfNecessary(tokenOut.contractName),
            tokenOutDecimals: tokenOut.onChainFTMetadata.decimals,
        });
    }

    async _transformNear(params) {
        const { account, tokenIn, amountIn } = params;

        return fungibleTokensService.transformNear({
            accountId: account.accountId,
            amount: amountIn,
            toWNear: tokenIn.contractName !== NEAR_TOKEN_ID,
        });
    }

    async _swapNearToToken(params) {
        const { account, tokenOutId, amountIn } = params;
        const transactions = [];
        const depositTransactions = await this._getDepositTransactions(
            account,
            [tokenOutId]
        );

        if (depositTransactions) {
            transactions.push(...depositTransactions);
        }

        const wrapNear = await fungibleTokensService.getWrapNearTx({
            accountId: account.accountId,
            amount: amountIn,
        });
        const swapActions = await this._exchange.getSwapActions({
            ...params,
            tokenInId: NEAR_TOKEN_ID,
        });

        transactions.push(wrapNear, {
            receiverId: NEAR_TOKEN_ID,
            actions: swapActions,
        });

        return this._processTransactions(account, transactions);
    }

    async _swapWNearToToken(params) {
        const { account, tokenOutId } = params;
        const transactions = [];
        const depositTransactions = await this._getDepositTransactions(
            account,
            [tokenOutId]
        );

        if (depositTransactions) {
            transactions.push(...depositTransactions);
        }

        const swapActions = await this._exchange.getSwapActions(params);

        transactions.push({
            receiverId: NEAR_TOKEN_ID,
            actions: swapActions,
        });

        return this._processTransactions(account, transactions);
    }

    async _swapTokenToNear(params) {
        const { account, tokenInId, tokenOutId, minAmountOut } = params;
        const transactions = [];
        const depositTransactions = await this._getDepositTransactions(
            account,
            [tokenInId, tokenOutId]
        );

        if (depositTransactions) {
            transactions.push(...depositTransactions);
        }

        const swapActions = await this._exchange.getSwapActions({
            ...params,
            tokenOutId: NEAR_TOKEN_ID,
        });
        const unwrapNear = await fungibleTokensService.getUnwrapNearTx({
            accountId: account.accountId,
            amount: minAmountOut,
        });

        transactions.push(
            {
                receiverId: tokenInId,
                actions: swapActions,
            },
            unwrapNear
        );

        return this._processTransactions(account, transactions);
    }

    async _swapTokenToWNear(params) {
        const { account, tokenInId, tokenOutId } = params;
        const transactions = [];
        const depositTransactions = await this._getDepositTransactions(
            account,
            [tokenInId, tokenOutId]
        );

        if (depositTransactions) {
            transactions.push(...depositTransactions);
        }

        const swapActions = await this._exchange.getSwapActions(params);

        transactions.push({
            receiverId: tokenInId,
            actions: swapActions,
        });

        return this._processTransactions(account, transactions);
    }

    async _swapTokenToToken(params) {
        const { account, tokenInId, tokenOutId } = params;
        const transactions = [];
        const depositTransactions = await this._getDepositTransactions(
            account,
            [tokenInId, tokenOutId]
        );

        if (depositTransactions) {
            transactions.push(...depositTransactions);
        }

        const swapActions = await this._exchange.getSwapActions(params);

        transactions.push({
            receiverId: tokenInId,
            actions: swapActions,
        });

        return this._processTransactions(account, transactions);
    }

    async _getDepositTransactions(account, tokenIds) {
        const txs = [];
        const { accountId } = account;

        for (const id of tokenIds) {
            const tokenStorage = await account.viewFunction(
                id,
                'storage_balance_of',
                { account_id: accountId }
            );

            if (!tokenStorage) {
                txs.push({
                    receiverId: id,
                    actions: [
                        nearApi.transactions.functionCall(
                            'storage_deposit',
                            {
                                account_id: accountId,
                                signer_id: accountId,
                                receiver_id: id,
                                registration_only: true,
                            },
                            FT_STORAGE_DEPOSIT_GAS,
                            FT_MINIMUM_STORAGE_BALANCE
                        ),
                    ],
                });
            }
        }

        return txs.length ? txs : null;
    }
    // @todo handle each transaction and break
    // subsequent TXs in case of previous one is failed;
    // return informative message in such situations
    async _processTransactions(account, txs) {
        const swapResult = {
            success: true,
        };

        for (const tx of txs) {
            const {
                transaction: { hash, actions },
            } = await account.signAndSendTransaction(tx);

            const swapTx = actions.find((action) => {
                if (action['FunctionCall']?.method_name === 'ft_transfer_call') {
                    return true;
                }
            });

            if (swapTx) {
                swapResult.swapTxHash = hash;
            }
        }

        return swapResult;
    }
}

export default new FungibleTokenExchange(refFinanceContract);
