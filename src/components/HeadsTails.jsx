import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import headImage from '../assets/head.png'
import tailsImage from '../assets/tail.png'
import { NotificationManager } from 'react-notifications';
import { useUser } from '../context/UserContext';
import { useContract } from '../context/ContractContext';
import Web3 from 'web3'
import Coinflip from '../abi/Coinflip.json'

const USDTADDRESS = "0xC8E3713cc70186ae409D55B9595f4Ec3d38e891a";
const DECIMAL = 6;
const COINFLIPADDRESS = Coinflip.address;
let web3 = new Web3(Web3.givenProvider)

let usdtContract = new web3.eth.Contract(Coinflip.usdtAbi, USDTADDRESS);



const Circle = styled.div`
    position: relative;
    top: 2rem;
    border: 1px solid pink;
    border-radius: 1rem;
    width 23rem;
    height: 18rem;
    margin: auto;
`;

const Text = styled.div`
    color: white;
    font-size: 1rem;
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
    margin-left: 1rem;
    margin-right: 1.8rem;
`;


const HeadsButton = styled.button`
    background-color: #df99a5;
    padding: 7px 5px;
    font-size: 15px;
    min-width: 120px;
    border-radius: 10px;
    font-weight: 700;
    color: white;
    border: none;
    cursor: pointer;
    outline: none;

    :hover {
        background-color: pink;
    }
    `;

const TailsButton = styled(HeadsButton)`
    background-color: #5D7B93;

    :hover {
        background-color: #7994aa;
    }
`;

const HeadImg = styled.div`
  background-image: url(${headImage});
  height: 160px;
  background-repeat: no-repeat;
`;

const TailsImg = styled.div`
  background-image: url(${tailsImage});
  height: 160px;
  background-repeat: no-repeat;
`;



export default function HeadsTails(props) {

    function toBigNum(value) {
        return web3.utils.toWei(value, "mwei");
    }


    const {
        userAddress,
        setUserBalance,
        setWinningsBalance
    } = useUser();

    const {
        setContractBalance,
    } = useContract();

    //fetching contract context

    const flip = async (oneZero, bet) => {
        let guess = oneZero
        let betAmt = bet
        let config = { from: userAddress }
        let txHash = "";

        usdtContract.methods.approve(COINFLIPADDRESS, toBigNum(betAmt)).send(config)
            .on("receipt", async function () {
                try {

                    props.coinflip.methods.flip(guess, toBigNum(betAmt)).send(config)
                        .on('transactionHash', (hash) => {
                            startAnimation();
                            txHash = hash;
                        })
                        .on('receipt', async function (receipt) {
                            const flipResult = parseInt(receipt.events["filpFinshed"].raw.data, 16);
                            console.log("result", oneZero, flipResult,receipt)
                            if (flipResult) {
                                NotificationManager.info("Congratulations you win");
                                stopAnimation(oneZero);
                            } else {
                                NotificationManager.info("You lose");
                                stopAnimation((oneZero + 1) % 2);
                            }
                            let balance = await props.coinflip.methods.contractBalance().call()
                            setContractBalance(web3.utils.fromWei(balance,"mwei"))
                            let userBal = await web3.eth.getBalance(userAddress)
                            setUserBalance(Number.parseFloat(web3.utils.fromWei(userBal)).toPrecision(3))
                            let config = { from: userAddress }
                            let bal = await props.coinflip.methods.getWinningsBalance().call(config)
                            setWinningsBalance(Number.parseFloat(web3.utils.fromWei(bal,"mwei")).toPrecision(3));
                        })
                        .catch((error) => {
                            console.log('Transaction error-------:', error);
                            stopAnimation(oneZero);
                        });

                } catch (err) {
                    console.log(err);
                    stopAnimation(oneZero);
                }
            })



    }

    const coin = useRef();
    const handleHeads = () => {
        if (props.betAmt <= .008) {
            NotificationManager.warning('Bets must be higher than .008 ETH');
        } else {
            startAnimation();
            let guess = 0
            let bet = props.betAmt
            flip(guess, bet)
        }
    }

    const handleTails = () => {
        if (props.betAmt <= .008) {
            // alert('Bets must be higher than .008 ETH')
            NotificationManager.warning('Bets must be higher than .008 ETH');
        } else {
            startAnimation();
            let guess = 1
            let bet = props.betAmt
            flip(guess, bet)
        }
        stopAnimation(0);
    }

    const startAnimation = () => {
        let i = Math.floor(Math.random() * 2);
        coin.current.style.animation = "none";
        if (i) {
            setTimeout(function () {
                coin.current.style.animation = "spin-heads 3s linear infinite";
            }, 100);
        }
        else {
            setTimeout(function () {
                coin.current.style.animation = "spin-tails 3s linear infinite";
            }, 100);
        }
        // setTimeout(updateStats, 3000);
        // disableButton();
    }

    const stopAnimation = (result) => {
        coin.current.style.animation = "none";
        if (result === 1) {
            coin.current.style.transform = 'rotateY(180deg)'
        } else {
            coin.current.style.transform = 'rotateY(0)'
        }
    }

    return (
        <Circle>
            <Text>
                <HeadsButton onClick={handleHeads}>
                    Heads
                </HeadsButton>
                <div>
                    or
                </div>
                <TailsButton onClick={handleTails}>
                    Tails
                </TailsButton>
            </Text>

            <div className="coin" ref={coin}>

                <div className="heads">
                    <HeadImg></HeadImg>
                </div>
                <div className="tails">
                    <TailsImg></TailsImg>
                </div>

            </div >
        </Circle >
    )
}