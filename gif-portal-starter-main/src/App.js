import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

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
  const [giftList, setGiftLit] = useState([]);

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
  const sendGift = async () => {
    if (inputValue.length > 0) {
      console.log('Gift Link:', inputValue)
      setGiftLit([...giftList, inputValue])
      setInputValue('')
    } else {
      console.log('Empty ULR')
    }
  }

  const onInputChange = event => {
    const { value } = event.target;
    setInputValue(value);
  }
  const renderNotConnectedContainer = () => {
    return <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}>
      Connect to wallet
    </button>
  }

  const renderConnectedContainer = () => {
    return <div className='connected-container'>
      <form
        onSubmit={event => {
          event.preventDefault()
          sendGift()
        }}>
        <input type='text' placeholder='Enter Gif link!' value={inputValue} onChange={onInputChange}></input>
        <button type='submit' className='cta-button submit-gif-button'>Submit</button>
      </form>

      <div className='gif-grid'>
        {giftList.map(gif => (
          <div className='gif-item' key={gif}>
            <img src={gif} alt={gif}></img>
          </div>
        ))}
      </div>
    </div>
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list ....')

      setGiftLit(TEST_GIFS)
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
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
