import React from 'react'
import styled from 'styled-components'
import BetForm from './BetForm'
import UserButton from './UserButton'

const Card = styled.div`
    position: relative;
    // height: 29.4rem;
    width: 380px;
    background: #5D432C;
    border: 3px solid #35281E;
    border-radius: 1.5rem;
    margin auto;
    margin-top: .5rem;
`;


export default function MainCard(props) {

    //passing withdraw function from Main as a prop to userButton
    const withdrawWinnings = () => {
        props.withdrawUserWinnings()
    }

    return (
        <Card>
            <BetForm
                userBalance={props.userBalance}
                coinflip={props.coinflip}
                updateBalances={props.updateBalances}
            />
            <UserButton
                withdrawWin={withdrawWinnings}
            />
        </Card>
    )
}