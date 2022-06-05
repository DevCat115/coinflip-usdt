import React, { useState, useEffect, useCallback } from 'react'
import Coinflip from '../abi/Coinflip.json'
import Web3 from 'web3'
import NavBar from './NavBar'
import ContractBalance from './ContractBalance'
import MainCard from './MainCard'
import OwnerScreen from './OwnerScreen'
import Directions from './Directions'
import ModalWindow from './ModalWindow'
import styled from 'styled-components'

import { useUser } from '../context/UserContext'
import { useContract } from '../context/ContractContext'

import { NotificationContainer, NotificationManager } from 'react-notifications';

const AlignContent = styled.div`
    position: relative;
    top: 1rem;
    display: flex;
    justify-content: space-between;
`;

const AlignQuarter = styled.div`
    width: 25%
`;

const AlignHalf = styled.div`
    width: 50%
`;

/**
 * @notice The necessary data required for the dApp.
 */
let web3 = new Web3(Web3.givenProvider)
// let contractAddress = web3.utils.toChecksumAddress('0xeed205d12965730582fc01a2c258b8624943f328');
let contractAddress = web3.utils.toChecksumAddress(Coinflip.address);


export default function Main() {


    //fetching user context
    const {
        userAddress,
        setUserAddress,
        userBalance,
        setUserBalance,
        winningsBalance,
        setWinningsBalance,
    } = useUser();

    //fetching contract context
    const {
        contractBalance,
        setContractBalance,
        owner,
        setOwner,
        setIsOwner,
        network,
        setNetwork,
        setAwaitingCallbackResponse,
        awaitingWithdrawal,
        setAwaitingWithdrawal,
    } = useContract();

    const fetchNetwork = useCallback(async () => {
        let num = await web3.currentProvider.chainId;
        if (num === '0x1') {
            setNetwork('Mainnet')
        } else if (num === '0x3') {
            setNetwork('Ropsten')
        } else if (num === '0x4') {
            setNetwork('Rinkeby')
        } else if (num === '0x5') {
            setNetwork('Goerli')
        } else if (num === '0x42') {
            setNetwork('Kovan')
        } else if (num === '0x38') {
            setNetwork('BSC')
        } else if (num === '0xfa2') {
            setNetwork('Fantom Testnet')
        } else {
            setNetwork('N/A')
        }
    }, [setNetwork])






    /**
     * @notice The following state hooks are used only within this functional
     *         component; ergo, they're not included in useContext. 
     */
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [coinflip, setCoinflip] = useState(new web3.eth.Contract(Coinflip.abi, contractAddress));
    const [outcomeMessage, setOutcomeMessage] = useState('');

    const initWeb3 = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.enable();
                const web3Instance = new Web3(window.ethereum);
                setCoinflip(new web3Instance.eth.Contract(Coinflip.abi, contractAddress));
                loadUserAddress();
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log('MetaMask not found. Please install MetaMask wallet extension.');
        }
    };

    useEffect(() => {
        initWeb3();
    }, [userAddress]);

    /**
     * @notice The following functions fetch both the user's Ethereum data and
     *         contract data. 
     */

    const loadUserAddress = useCallback(async () => {
        console.log("user addresses start");
        let accounts = await web3.eth.getAccounts()
        console.log("accounts", accounts);
        let account = accounts[0]
        return account
    }, [coinflip])

    const loadContractBalance = useCallback(async () => {
        let balance = await coinflip.methods.contractBalance().call()
        setContractBalance(web3.utils.fromWei(balance,"mwei"))
        console.log("contract balance", balance);
    }, [setContractBalance])

    const loadUserBalance = useCallback(async (user) => {
        console.log("get user balance", user);
        if (user) {
            let userBal = await web3.eth.getBalance(user)
            setUserBalance(Number.parseFloat(web3.utils.fromWei(userBal)).toPrecision(3))
        }
    }, [setUserBalance])

    const loadWinningsBalance = useCallback(async (userAdd) => {
        let config = { from: userAdd }
        let bal = await coinflip.methods.getWinningsBalance().call(config)
        setWinningsBalance(Number.parseFloat(web3.utils.fromWei(bal,"mwei")).toPrecision(3));
    }, [setWinningsBalance])

    const loadOwner = useCallback(async () => {
        let theOwner = await coinflip.methods.owner().call()
        setOwner(theOwner)
        return theOwner
    }, [setOwner])


    /**
     * @notice This function mimics the late React approach of componentDidMount; 
     *         where, this acts as an initialization of the dApp by fetching the
     *         user's Ether data.
     */

    const loadUserData = useCallback(async () => {
        await loadUserAddress().then(response => {
            setUserAddress(response)
            loadUserBalance(response)
            loadWinningsBalance(response)
        })
    },
        [loadUserAddress,
            setUserAddress,
            loadUserBalance,
            loadWinningsBalance
        ])


    /**
     * @notice This hook acts as an initializer a la componentDidMount. 
     *         
     */
    useEffect(() => {
        // if(userAddress === ''){
        loadUserData()
        // }
    }, [loadUserData, userAddress])



    /**
     * @notice This hook loads the network and balance of the contract.
     * 
     */
    useEffect(() => {
        fetchNetwork()
        loadContractBalance()
        loadOwner().then(response => {
            setOwner(response)
        })
    }, [network, fetchNetwork, loadContractBalance, loadOwner, setOwner])

    /**
     * @notice This hook specifically checks if the user's address matches with 
     *         the owner of the contract.
     */
    useEffect(() => {
        if (userAddress) {
            if (userAddress.length !== 0 && owner.length !== 0) {
                if (userAddress === owner) {
                    setIsOwner(true)
                } else {
                    setIsOwner(false)
                }
            }
        }
    }, [userAddress, owner, setIsOwner, coinflip])



    /**
     * @notice The following function simulates the flipping of a coin. 
     * 
     * @dev    Upon receipt, the setSentQueryId state is set with the user's
     *         query ID. Further, the awaiting callback repsonse state is set
     *         with true which is responsible for looking through the blocks for
     *         the user's query ID.
     * 
     * @param {*} oneZero The numeric representation of heads or tails—heads is zero, 
     *                    tails is one.
     * @param {*} bet The wagered amount.
     */

    // const flip = async (oneZero, bet) => {
    //     setAwaitingCallbackResponse(false)
    //     console.log("test");
    //     let guess = oneZero
    //     let betAmt = bet
    //     let config = {
    //         value: web3.utils.toWei(betAmt, 'ether'),
    //         from: userAddress
    //     }
    //     console.log("start flip");
    //     coinflip.methods.flip(guess).send(config)
    //         .on('transactionHash', (hash) => {
    //             ref.current.startAnimation();
    //         })
    //         .on('receipt', function (receipt) {
    //             const flipResult = parseInt(receipt.events[0].raw.data, 16);
    //             if (flipResult) {
    //                 NotificationManager.info("Congratulations you win");
    //                 ref.current.stopAnimation(oneZero);
    //             } else {
    //                 NotificationManager.info("You lose");
    //             }
    //             loadWinningsBalance(userAddress);
    //             loadContractBalance();
    //         })
    //         .on('error', (error) => {
    //             console.error('Transaction error:', error);
    //         });
    // }

    /**
     * @notice This function closes the modal when the user hits 'okay,' and resets 
     *         the outcome message to an empty string. 
     */
    const modalMessageReset = () => {
        setModalIsOpen(false)
        setOutcomeMessage('')
    }

    /**
     * @notice This hook searches through Ethereum's blocks for the Provable query ID.
     *         Once found, it looks for the event string 'Winner' or 'Loser' and updates 
     *         the modal outcome message. Thereafter, it reloads the user's winnings
     *         balance and contract balance. 
     */



    /**
     * @notice This function withdraws the user's winnings balance into the user's
     *         actual MetaMask wallet.
     */

    const withdrawUserWinnings = () => {
        var balance = winningsBalance
        coinflip.methods.withdrawUserWinnings().send(balance, { from: userAddress })
        setAwaitingWithdrawal(true)
    }


    /**
     * @notice The following functions are reserved for the owner of the contract.
     * 
     * 
     * @notice This function adds Ether to the contract.
     * @param {*} x The amount of Ether to transfer into the contract balance.
     */

    const fundContract = (x) => {
        let fundAmt = x
        let config = {
            value: web3.utils.toWei(fundAmt, 'ether'),
            from: userAddress
        }
        coinflip.methods.fundContract().send(config)
            .once('receipt', function (receipt) {
                loadContractBalance()
                loadUserBalance(userAddress)
            })
    }

    /**
     * @notice This function adds Ether to the user's winnings balance. This is created
     *         for testing purposes.
     * 
     * @param {*} x The amount of Ether to transfer to the mapping balance.
     */
    const fundWinnings = (x) => {
        let fundAmt = x
        let config = {
            value: web3.utils.toWei(fundAmt, 'ether'),
            from: userAddress
        }
        coinflip.methods.fundWinnings().send(config)
            .once('receipt', function (receipt) {
                loadWinningsBalance(userAddress)
                loadUserBalance(userAddress)
            })
    }

    /**
     * @notice This function withdraws the entire contract balance to the owner.
     * @dev    The contract balance does not include any users' winnings balances.
     */

    const withdrawAll = () => {
        var balance = contractBalance
        coinflip.methods.withdrawAll().send(balance, { from: userAddress })
            .on('receipt', function (receipt) {
                loadContractBalance()
                loadUserBalance(userAddress)
            })
    }

    const updateBalances = () => {
        loadContractBalance()
        loadUserBalance(userAddress)

    }

    /**
     * @notice This hook communicates to the user when their withdrawal of funds from
     *         their winnings balance succeeded. Upon receipt, their winnings balance and 
     *         actual user balance reloads. 
     */
    useEffect(() => {
        if (awaitingWithdrawal) {
            coinflip.events.userWithdrawal({
                fromBlock: 'latest'
            }, function (error, event) {
                if (event.returnValues[0] === userAddress) {
                    setOutcomeMessage(web3.utils.fromWei(event.returnValues[1],"mwei") + ' USDT Successfully Withdrawn')
                    loadWinningsBalance()
                    loadUserBalance(userAddress)
                }
            })
            setAwaitingWithdrawal(false)
        }
    }, [awaitingWithdrawal, winningsBalance, userBalance, userAddress, loadUserBalance, loadWinningsBalance, setAwaitingWithdrawal])



    /**
     * @notice This hook controls the modal which tells the user whether they won/lost the coinflip or
     *          the success of their withdrawal.
     */
    useEffect(() => {
        if (outcomeMessage !== '') {
            setModalIsOpen(true)
        }
        return
    }, [outcomeMessage])


    return (
        <div>
            <NavBar />
            <ModalWindow open={modalIsOpen}
                onClose={() => modalMessageReset()
                }>
                {outcomeMessage}
            </ModalWindow>
            <div className='maincard-content'>
                <div >
                    <ContractBalance />
                    <MainCard
                        withdrawUserWinnings={withdrawUserWinnings}
                        coinflip={coinflip}
                        updateBalances={updateBalances}
                    />
                </div>
                {/* <AlignQuarter>
                    <OwnerScreen
                        fundContract={fundContract}
                        fundWinnings={fundWinnings}
                        withdrawAll={withdrawAll}
                    />
                </AlignQuarter> */}
            </div>
            <NotificationContainer />
        </div>
    )
}

