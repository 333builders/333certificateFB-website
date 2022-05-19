import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useConnect, useNetwork, useContractWrite } from "wagmi";
import LOGO from "../components/Logo";
import { useForm, SubmitHandler } from "react-hook-form";
import Abi from '../../public/CertificateFB333Builders.json'
import { TailSpin } from 'react-loader-spinner'

const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

type Inputs = {
  name: string;
};

const Home: NextPage = (props) => {
  const [minted, setMinted] = useState(false);
  const isMounted = useIsMounted();
  const [cid, setCid] = useState('')
  const [ready, isReady] = useState(false)
  const [
    {
      data: { connector, connectors, connected },
      error,
      loading,
    },
    connect,
  ] = useConnect();
  const [{ data: networkData, error: switchNetworkError }, switchNetwork] =
    useNetwork();

  const SwitchNetwork = () => {
    return (
      <>
        {switchNetwork && networkData.chain.id !== 80001 && (
          <button
            className="btn btn-primary rounded-full"
            onClick={() => switchNetwork(80001)}
          >
            Switch to Polygon
          </button>
        )}
        {switchNetwork && networkData.chain.id == 80001 && <></>}
      </>
    );
  };

  const Login = () => {
    return (
      <>
        <p className="text-xl">Congrats, here is your certificate!</p>
        <div className="w-[360px] h-40 relative">
          <Image
            src="/certificatetemplate.png"
            layout="fill"
            objectFit="cover"
          />
        </div>
        {connectors.map((x) => (
          <button
            className="btn btn-primary rounded-full"
            disabled={isMounted && !x.ready}
            key={x.name}
            onClick={() => connect(x)}
          >
            {x.id === "injected" ? (isMounted ? x.name : x.id) : x.name}
            {isMounted && !x.ready && " (unsupported)"}
            {loading && x.name === connector?.name && "…"}
          </button>
        ))}
        <p>Connect to your Metamask wallet to mint</p>
      </>
    );
  };

  const Minter = () => {
    const [load, isLoading] = useState(false)
    const [name, setName] = useState('')
    const [template, setTempalte] = useState('white')

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async (data) => {

      isLoading(true)
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template: template, name: name })
      });
      if (response.ok) {
        const json_response = await response.json();
        setCid(json_response.result)
        isReady(true)
      }
      isLoading(false)
    };

    const ButtonSubmit = () => {
      return (
        <>
          <div className="w-full pt-8">
            <input type="submit" className="w-full btn btn-primary " value="create certificate" />
          </div>
        </>
      )
    }

    const ButtonLoading = () => {
      return (
        <>
          <div className="w-full pt-8 text-center">
            <TailSpin color="#FFF" height={40} width={40} wrapperStyle={{ justifyContent: "center" }} />
          </div>
        </>
      )
    }

    const ButtonMint = () => {
      const [message, setMessage] = useState('')
      const [load, isLoading] = useState(false)
      const [{ data, error, loading }, write] = useContractWrite(
        {
          addressOrName: '0x30811f42fC3191a7f0e8686160C1AfC77a73aa32',
          contractInterface: Abi.abi,
        },
        'mint',
        {
          args: cid,
        }
      )

      const ButtonLife = () => {
        return (
          <>
            <button
              className='w-full btn btn-primary'
              onClick={async () => {
                isLoading(true)
                const tx = await write()
                if (tx.data !== undefined) {
                  await tx.data.wait()
                }
                if (tx.error !== undefined) {
                  setMessage('Error, remember you can mint once')
                }
                else {
                  setMinted(true)
                }
                isLoading(false)
              }}>MINT</button>
          </>
        )
      }

      return (
        <div className="w-full pt-8">
          {load ? <ButtonLoading /> : <ButtonLife />}
          <div className="pt-4">{message}</div>
        </div>
      )
    }

    return (
      <>
        <form
          className="form-control w-full max-w-lg card space-y-8 bg-slate-700"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card-body">
            {ready && <p className="text-center">Certificate is ready, now you can mint it and create your NFT!</p>
            }
            {!ready &&
              <>
                <label className="label">
                  <span className="label-text">What is your name?</span>
                </label>
                <input
                  maxLength={30}
                  className="input "
                  placeholder="Mario Rossi"
                  {...register("name", {
                    required: true,
                    onChange: (event) => {
                      setCid('')
                      isReady(false)
                      setName(event.target.value)
                    },
                    disabled: load
                  })
                  }
                /></>}
            {errors.name && <span>This field is required</span>}
            {load && <ButtonLoading />}
            {!load && !ready && <ButtonSubmit />}
            {!load && ready && <ButtonMint />}
          </div>
        </form>
      </>
    );
  };

  const Opensea = () => {
    return (
      <>
        <p className="text-3xl max-w-md text-center">
          The certificate is minted to your wallet, you can see it on Opensea!
        </p>
        <button
          className="btn btn-primary rounded-full"
          onClick={() => {
            const link = "https://testnet.opensea.io/";
            window.open(link, "_blank");
          }}
        >
          See my certificate
        </button>
        <button
          className="btn btn-primary rounded-full"
          onClick={() => {
            const link = "https://333builders.com/";
            window.open(link, "_self");
          }}
        >
          Go to 333.Builders
        </button>
      </>
    );
  };

  return (
    <div>
      <Head>
        <title>333.Builders</title>
        <meta name="description" content="333.Builders" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
        <LOGO />
        <h2 className="text-3xl font-bold text-center pb-16">333.Builders</h2>
        <SwitchNetwork />
        {!connected ? (
          <Login />
        ) : (
          <>{!minted ? <Minter /> : <Opensea />}</>
        )}
      </div>
    </div>
  );
};

export default Home;