import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MoralisContext, useMoralis } from "react-moralis";
import { ExclamationIcon, XIcon } from "@heroicons/react/outline";
import contractInfo from "../contracts/APIConsumer.json";
import AudioPlayer from "components/AudioPlayer.jsx";
import { Spinner } from "../components/Spinner";
import { notification } from "antd";

const AUDIO_SAVED_EVENTS_CLASS = "AudioSavedEvents";
const YOUTUBEDL_AUDIO_CONTRACT_ADDRESS =
  "0x40450Dc4360A46E33fCfAe5543cAb399DE6A0b89";

function Index() {
  const [savedAudio, setSavedAudio] = useState([]);
  const [youTubeUrl, setYouTubeUrl] = useState("");
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { abi } = contractInfo;
  const { Moralis, authenticate, isAuthenticated, user, isWeb3Enabled } =
    useMoralis();
  Moralis.initialize(process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID);

  const [isLoading, setIsLoading] = useState(false);

  const toIpfsGatewayURL = (cid) => {
    return `https://dweb.link/ipfs/${cid}`;
  };

  const openNotification = ({ message, description }) => {
    notification.open({
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  useEffect(() => {
    let subscription;

    if (isAuthenticated) {
      const getAudioSavedEvents = async () => {
        const user = await Moralis.User.current();
        const senderAccounts = user.attributes.accounts;
        const AudioSavedEventsClass = Moralis.Object.extend(
          AUDIO_SAVED_EVENTS_CLASS
        );
        const query = new Moralis.Query(AudioSavedEventsClass);
        query.descending("createdAt");
        query.equalTo("sender", senderAccounts[0]);
        const results = await query.find();
        console.log(results);
        // const web3 = await Moralis.Web3.enableWeb3();
        const newSavedAudio = results.map((result) => ({
          id: result.id,
          title: result.attributes.title,
          cid: result.attributes.cid,
          thumbnail: result.attributes.thumbnail,
        }));
        console.log(newSavedAudio);
        setSavedAudio(newSavedAudio);
      };

      const audioEventSubscription = async () => {
        const user = await Moralis.User.current();
        const senderAccounts = user.attributes.accounts;
        let query = new Moralis.Query(AUDIO_SAVED_EVENTS_CLASS);
        subscription = await query.subscribe();
        subscription.on("create", async (object) => {
          console.log("create");
          if (true) {
            if (senderAccounts.includes(object.attributes.sender)) {
              console.log("Create event for current user", object.attributes);
              getAudioSavedEvents();
              setIsLoading(false);
            }
          }
        });
        subscription.on("delete", async (object) => {
          console.log("delete");
          if (true) {
            if (senderAccounts.includes(object.attributes.sender)) {
              console.log("Delete event for current user", object.attributes);
              getAudioSavedEvents();
            }
          }
        });
      };

      // hack to avoid error access Parse
      audioEventSubscription().then(() => {
        getAudioSavedEvents();
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated]);

  const onSubmitYouTubeUrl = async (e) => {
    e.preventDefault();
    if (youTubeUrl) {
      await Moralis.enableWeb3();
      console.log(youTubeUrl);
      console.log(`isAthenticated: ${isAuthenticated}`);
      const options = {
        contractAddress: YOUTUBEDL_AUDIO_CONTRACT_ADDRESS,
        functionName: "requestYouTubeAudioData",
        abi,
        params: {
          youTubeUrl,
        },
      };
      setIsLoading(true);
      try {
        const tx = await Moralis.Web3.executeFunction({
          awaitReceipt: false,
          ...options,
        });
        tx.on("receipt", (receipt) => {
          console.log("transactionHash: ", receipt.transactionHash);
          console.log("New Receipt: ", receipt);
        }).on("error", (err) => {
          console.log(err);
          setIsLoading(false);
          openNotification({
            message: "There was an error",
            description: err.message,
          });
        });
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        openNotification({
          message: "There was an error",
          description: err.message,
        });
      }
    }
    setYouTubeUrl("");
    setIsModalVisible(false);
  };

  const onRemoveClick = async (e, id) => {
    console.log(id);
    try {
      const AudioSavedEventsClass = Moralis.Object.extend(
        AUDIO_SAVED_EVENTS_CLASS
      );
      const query = new Moralis.Query(AudioSavedEventsClass);
      const audioSavedEvent = query.get(id);
      (await audioSavedEvent).destroy();
    } catch (err) {
      console.log(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-700 rounded-full ">
        <div className="flex items-center px-4 py-2 space-x-2">
          <div className="text-lg font-medium text-[#b7e800] ">
            Don&apos;t be shy - please authenticate
          </div>
          <div className="text-[#b7e800]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl sm:w-4/5 min-w-min">
      {isLoading && (
        <div className="flex items-center justify-center pb-2">
          <div className="flex items-center justify-center p-2 space-x-2 bg-gray-700 rounded-full">
            <Spinner className="w-8 h-8 text-[#b7e800]" />
            <p className="text-lg font-semibold text-[#b7e800]">
              Downloading...
            </p>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {savedAudio.map((saved) => (
          <li className="bg-white shadow rounded-xl" key={saved.id}>
            <div className="flex flex-col p-2 space-y-2 sm:p-4">
              <div className="flex justify-between space-x-2">
                <img
                  className="object-cover w-12 h-12 rounded"
                  src={saved.thumbnail}
                  alt="Thumbnnail image"
                />
                <div className="w-full text-lg font-medium sm:w-1/">
                  {saved.title}
                </div>
                <button
                  className="flex items-start hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100"
                  onClick={(e) => onRemoveClick(e, saved.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="">
                <AudioPlayer audioUrl={`https://${saved.cid}.ipfs.dweb.link`} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isModalVisible ? (
        <Transition.Root show={isModalVisible} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={setIsModalVisible}
          >
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block w-full px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                      type="button"
                      className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100"
                      onClick={() => setIsModalVisible(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>

                  <form onSubmit={onSubmitYouTubeUrl}>
                    <div className="sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Enter YouTube Url
                        </Dialog.Title>
                        <div className="mt-2">
                          <input
                            className="w-full h-10 px-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7e800] sm:mt-0 sm:text-sm"
                            name="youtube_url"
                            type="text"
                            onChange={(e) => setYouTubeUrl(e.target.value)}
                            value={youTubeUrl}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-[#b7e800] border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7e800] sm:ml-3 sm:w-auto sm:text-sm"
                        // onClick={() => setIsModalVisible(false)}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7e800] sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={() => setIsModalVisible(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      ) : (
        <div className="absolute bottom-5 right-8">
          <div className="flex bg-white rounded-full">
            <button
              className=""
              onClick={() => {
                setIsModalVisible(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-[#b7e800]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
