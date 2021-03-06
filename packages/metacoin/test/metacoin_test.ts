import { BlockchainLifecycle, devConstants } from '@0xproject/dev-utils';
import { ContractArtifact } from '@0xproject/sol-compiler';
import { LogWithDecodedArgs } from '@0xproject/types';
import { BigNumber } from '@0xproject/utils';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import * as chai from 'chai';

import * as MetacoinArtifact from '../artifacts/Metacoin.json';
import { MetacoinContract, TransferContractEventArgs } from '../src/contract_wrappers/metacoin';

import { chaiSetup } from './utils/chai_setup';
import { config } from './utils/config';
import { provider, web3Wrapper } from './utils/web3_wrapper';

const artifact: ContractArtifact = MetacoinArtifact as any;

chaiSetup.configure();
const { expect } = chai;
const blockchainLifecycle = new BlockchainLifecycle(web3Wrapper);

describe('Metacoin', () => {
    let metacoin: MetacoinContract;
    const ownerAddress = devConstants.TESTRPC_FIRST_ADDRESS;
    const INITIAL_BALANCE = new BigNumber(10000);
    before(async () => {
        metacoin = await MetacoinContract.deployFrom0xArtifactAsync(artifact, provider, config.txDefaults);
        web3Wrapper.abiDecoder.addABI(metacoin.abi);
    });
    beforeEach(async () => {
        await blockchainLifecycle.startAsync();
    });
    afterEach(async () => {
        await blockchainLifecycle.revertAsync();
    });
    describe('#constructor', () => {
        it(`should initialy give ${INITIAL_BALANCE} tokens to the creator`, async () => {
            const balance = await metacoin.balances.callAsync(ownerAddress);
            expect(balance).to.be.bignumber.equal(INITIAL_BALANCE);
        });
    });
    describe('#transfer', () => {
        it(`should successfully transfer tokens (via transfer1)`, async () => {
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
            const amount = INITIAL_BALANCE.div(2);
            const oldBalance = await metacoin.balances.callAsync(ZERO_ADDRESS);
            expect(oldBalance).to.be.bignumber.equal(0);
            const txHash = await metacoin.transfer1.sendTransactionAsync(
                {
                    to: ZERO_ADDRESS,
                    amount,
                },
                { from: devConstants.TESTRPC_FIRST_ADDRESS },
            );
            const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
            const transferLogs = txReceipt.logs[0] as LogWithDecodedArgs<TransferContractEventArgs>;
            expect(transferLogs.args).to.be.deep.equal({
                _to: ZERO_ADDRESS,
                _from: devConstants.TESTRPC_FIRST_ADDRESS,
                _value: amount,
            });
            const newBalance = await metacoin.balances.callAsync(ZERO_ADDRESS);
            expect(newBalance).to.be.bignumber.equal(amount);
        });

        it(`should successfully transfer tokens (via transfer2)`, async () => {
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
            const amount = INITIAL_BALANCE.div(2);
            const oldBalance = await metacoin.balances.callAsync(ZERO_ADDRESS);
            expect(oldBalance).to.be.bignumber.equal(0);
            const callback = 59;
            const txHash = await metacoin.transfer2.sendTransactionAsync(
                {
                    to: ZERO_ADDRESS,
                    amount,
                },
                callback,
                { from: devConstants.TESTRPC_FIRST_ADDRESS },
            );
            const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
            const transferLogs = txReceipt.logs[0] as LogWithDecodedArgs<TransferContractEventArgs>;
            expect(transferLogs.args).to.be.deep.equal({
                _to: ZERO_ADDRESS,
                _from: devConstants.TESTRPC_FIRST_ADDRESS,
                _value: amount,
            });
            const newBalance = await metacoin.balances.callAsync(ZERO_ADDRESS);
            expect(newBalance).to.be.bignumber.equal(amount);
        });

        it(`should successfully transfer tokens (via transfer3)`, async () => {
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
            const amount = INITIAL_BALANCE.div(2);
            const oldBalance = await metacoin.balances.callAsync(ZERO_ADDRESS);
            expect(oldBalance).to.be.bignumber.equal(0);
            const callback = 59;
            const txHash = await metacoin.transfer3.sendTransactionAsync(
                {
                    transferData: {
                        to: ZERO_ADDRESS,
                        amount,
                    },
                    callback,
                },
                { from: devConstants.TESTRPC_FIRST_ADDRESS },
            );
            const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
            const transferLogs = txReceipt.logs[0] as LogWithDecodedArgs<TransferContractEventArgs>;
            expect(transferLogs.args).to.be.deep.equal({
                _to: ZERO_ADDRESS,
                _from: devConstants.TESTRPC_FIRST_ADDRESS,
                _value: amount,
            });
            const newBalance = await metacoin.balances.callAsync(ZERO_ADDRESS);
            expect(newBalance).to.be.bignumber.equal(amount);
        });
    });
});
