import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Program, Provider, web3 } from '@project-serum/anchor'
import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer'
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json'
import kp from './keypair.json'

const { SystemProgram, Keypair } = web3;
window.Buffer = Buffer;

// let baseAccount = Keypair.generate()
const arr =Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = Keypair.fromSecretKey(secret)

const ProgramID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')

const opts = {
  preflightCommitment: 'processed'
  // preflightCommitment: 'finalized'
}

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  'https://media2.giphy.com/media/b8RfbQFaOs1rO10ren/giphy.gif?cid=790b7611ba0d47061f87b67084cbaf2e86e14353ede73c2c&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/yoJC2GnSClbPOkV0eA/giphy.gif?cid=ecf05e473c9e8415a1758f1908503d43d4050b73290ad289&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/FNhXqYTAbg3kOs1a2m/giphy.gif?cid=790b7611ebf837c91c0af8c1ccca653bb5f3d044aba7afbd&rid=giphy.gif&ct=g'
]

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        console.log('Phantom wallet found!')

        const response = await solana.connect({ onlyIfTrusted: true })
        console.log('Connected with Public key:', response.publicKey.toString())
        setWalletAddress(response.publicKey.toString())
      } else {
        alert('Solana object not found!, Get a Phantom wallet')
      }

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString())
    }
  }
  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gift Link:', inputValue)

      try {
        const provider = getProvider()
        const program = new Program(idl, ProgramID, provider)
        await program.rpc.addGif(inputValue, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey
          }
        })
        console.log('GIF successfully send to Program', inputValue)
        await getGifsList();
        setInputValue('')
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log('Empty ULR, try again')
    }
  }

  const onInputChange = event => {
    const { value } = event.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new Provider(connection, window.solana, opts.preflightCommitment)
    return provider
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, ProgramID, provider)
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]

      })
      console.log('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString());
      await getGifsList();
    } catch (error) {
      console.log('Error creating BaseAccount account', error)
    }
  }

  const renderNotConnectedContainer = () => {
    return <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}>
      Connect to wallet
    </button>
  }

  const renderConnectedContainer = () => {

    if (gifList === null) {
      return (
        <div className='connected-container'>
          <button className='cta-button submit-gif-button' onClick={createGifAccount}>
            Do One-Time Initialization for GIF Program Account
          </button>
        </div>
      )
    }
    else {
      return (
        <div className='connected-container'>
          <form
            onSubmit={event => {
              event.preventDefault()
              sendGif()
            }}>
            <input type='text' placeholder='Enter Gif link!' value={inputValue} onChange={onInputChange}></input>
            <button type='submit' className='cta-button submit-gif-button'>Submit</button>
          </form>

          <div className='gif-grid'>
            {gifList.map((item, index) => (
              <div className='gif-item' key={index}>
                <img src={item.gifLink} alt={item.gifLink}></img>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  const getGifsList = async () => {
    try {
      const provider = getProvider()
      const program = new Program(idl, ProgramID, provider)
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey)

      console.log('Got the account', account)
      setGifList(account.gifList)
    } catch (error) {
      console.log('Error in getGiflist', error)
      setGifList(null)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list ....')
      getGifsList()
    }
  }, [walletAddress])

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        {/* <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div> */}
      </div>
    </div>
  );
};

export default App;
