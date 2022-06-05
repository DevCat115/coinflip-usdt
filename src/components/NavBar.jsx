import React from 'react'
import styled from 'styled-components'
import ethLogo from '../assets/ethLogo.png'

import { useUser } from '../context/UserContext'
import { useContract } from '../context/ContractContext'
import Web3 from 'web3'

const Nav = styled.nav`
    border-bottom: 1px solid black;
    height: 4rem;
`;

const NavCenter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: .5rem;
    `;

const TitleLogo = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    `;

const Img = styled.img`
    margin-left: 1.2rem;
    height: 3.5rem;
    width: 3.rem;
    pointer-events: none;
`;

const H1 = styled.div`
    color: white;
    text-shadow: 2px 2px #666666;
    font-size: 2.25rem;
    font-weight: bolder;
    margin-left: 1rem;
`;

const Circle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 2.2rem;
    width: 15.5rem;
    padding-left: .6rem;
    border-radius: .8rem;
    border: 1px solid #666666;
    background: white;
    color: #5D432C;
    font-height: 4rem;
    font-size: 1.2rem;
    text-shadow: .5px .5px pink;
    border-right: 1px solid #666666;
    margin-right: 2rem;
    `;

const CircleTwo = styled(Circle)`
    border: 1px solid #35281E;
    height: 1.9rem;
    width: 7.8rem;
    color: white;
    padding-right: .5rem;
    padding-left: .4rem;
    padding-bottom: .05rem;
    background: #5D432C;
    border-radius: .8rem;
    margin-right: 0
`;

const Div = styled.div`
    display: flex;
    align-items: center;
`;

const NetworkDiv = styled.div`
    margin-right: 2rem;
    font-size: 1.3rem;
`;


export default function Navbar() {

    //user context
    const {
        userAddress,
        userBalance,
        setUserAddress
    } = useUser()

    //contract context
    const {
        network
    } = useContract()

    const address = userAddress ? userAddress.slice(0, 5) + '...' + userAddress.slice(37, 42) : null
    const connectWallet = async () => {
        await window.ethereum.enable();
        let web3 = new Web3(Web3.givenProvider)
        console.log("user addresses start");
        let accounts = await web3.eth.getAccounts()
        console.log("accounts", accounts);
        let account = accounts[0]
        setUserAddress(account);
        return account
    }

    console.log("userbalance----", parseFloat(userBalance).toFixed(3), typeof userBalance);

    return (
        <Nav>
            <NavCenter>
                <TitleLogo>
                    <Img src={ethLogo} alt='ethereum logo' />
                    <H1 className='nav-title'> Coinflip dApp </H1>
                </TitleLogo>
                <Div >
                    <NetworkDiv className='nav-title'>
                        {network}
                    </NetworkDiv>
                    {userAddress ? (
                        <Circle >
                            {userBalance} ETH
                            <CircleTwo>
                                {address}
                            </CircleTwo>
                        </Circle>
                    ) : (
                        <div><button className='connect-wallet' onClick={connectWallet}>connect wallet</button></div>
                    )}

                </Div>
            </NavCenter>
        </Nav>
    )
}