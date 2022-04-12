import {ThirdwebWeb3Provider} from "@3rdweb/hooks";

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebWeb3Provider>
      <Component {...pageProps} />
    </ThirdwebWeb3Provider>
  )
}

export default MyApp
