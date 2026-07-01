"use client";
import { useState, useEffect, useRef } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import "react-loading-skeleton/dist/skeleton.css";
import Spinner from "./Components/Spinner";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {

  const [isUploading, setIsUploading] = useState(false)
  const [ID, setID] = useState("")
  const [isImageLoading, setImageLoading] = useState(false)
  const [searchPreview, setSearchPreview] = useState<string | null>(null)
  const [fileName, setfileName] = useState<File | null>(null)
  const [Preview, setPreview] = useState<string | null>(null);
  const [isDownloading, setisDownloading] = useState(false)

  const inpRef = useRef<HTMLInputElement>(null)

  const notifySuccess = (text: any) => {
    toast.success(`${text}`, {
      duration: 4000,
      position: 'top-center',

      // Styling
      style: {},
      className: 'lg:w-[20vw] border-2 mt-5',

      // Change colors of success/error/loading icon
      iconTheme: {
        primary: '#008000',
        secondary: '#fff',
      },

      // Aria
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },

      // Additional Configuration
      removeDelay: 2000,

      // Toaster instance
      toasterId: 'default',
    });
  };
  const notifyError = (text: any) => {
    toast.error(`${text}`, {
      duration: 4000,
      position: 'top-center',

      // Styling
      style: {},
      className: 'lg:w-[20vw] border-2 mt-5',

      // Custom Icon


      // Change colors of success/error/loading icon
      iconTheme: {
        primary: '#ff0000',
        secondary: '#fff',
      },

      // Aria
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },

      // Additional Configuration
      removeDelay: 2000,

      // Toaster instance
      toasterId: 'default',
    });
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreview(null)
    setSearchPreview(null)
    setID("")
    const file = event.target.files?.[0];

    if (file) {
      setfileName(file)
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
    }

  };
  const sendImage = async () => {
    setID("")
    setIsUploading(true)
    try {
      if (!fileName) {
        setIsUploading(false)
        notifyError("No File Selected!")
        return;
      }

      const formData = new FormData();
      formData.append("image", fileName);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          notifySuccess("File Uploaded Successfully!")
          console.log((data.imageUrl.split("uploadPhoto/")[1]).split(".")[0])
          setID((data.imageUrl.split("uploadPhoto/")[1]).split(".")[0])
        }
        else {
          setIsUploading(false)
          notifyError("Internal Server Error")

        }

      } catch (error) {

        setIsUploading(false)
        notifyError("Currently , The System is down !")

      }


    } catch (err) {
      setIsUploading(false)
    }
    setIsUploading(false)
  };

  const getImage = async () => {
    const req = inpRef?.current?.value?.trim()

    if (!req) {
      notifyError("Give Some Inputs, Bro!")
      return
    }

    setID("")
    setPreview(null)
    setSearchPreview(null)
    setImageLoading(true)

    try {
      const url = `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${req}.jpg`
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) {
        notifySuccess("Image Found")
        setSearchPreview(url)
      } else {
        notifyError("No Such Image Found!")
        setSearchPreview(null)
      }
    } catch (error) {
      notifyError("No Such Image Found!")
      setSearchPreview(null)
    } finally {
      if (inpRef.current) {
        if (inpRef.current) {
          inpRef.current.value = ""
        }
      }
      setImageLoading(false)
    }
  }

  const downloadImage = async (imageURL: string) => {
    setisDownloading(true)
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageURL }),
    });

    if (!response.ok) {
      throw new Error("Failed to download image");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
    setisDownloading(false)
  };

  return (
    <div className=" w-[99vw] bg-white h-screen flex  items-center flex-col gap-5 ">
      <div><Toaster
        position="top-center"
        reverseOrder={false} /></div>

      <div className="nav w-[80vw] lg:mb-10 flex flex-row border-b-2 border-neutral-600   lg:justify-between justify-between lg:px-20 px-5 py-2">
        <h1 className="lg:text-xl md:text-xl md:font-bold text-black tracking-widest text-sm font-semibold">UP LOADER</h1>
        <a className="font-semibold underline lg:text-lg md:text-md text-xs text-neutral-700" target="_blank" href="https://instagram.com/the_binodd">Developer</a>
      </div>

      <p className="text-xs text-start w-[85vw] lg:w-[30vw] -mb-3 text-neutral-500">Note : Use 8 Character Code to Download your Image</p>

      <div className="input flex flex-row gap-2">

        <input ref={inpRef} type="text" className="border-2 uppercase tracking-widest border-neutral-600 rounded-sm text-sm lg:text-md px-3 w-[65vw] lg:w-[20vw] md:w-[40vw] py-3 text-neutral-600" placeholder="eg. A6D8-LM10" name="" id="" />
        <button onClick={getImage} className="bg-[#F9FAFB] lg:w-[10vw] hover:bg-blue-300 w-[20vw] text-sm text-center border-blue-500 py-3 cursor-pointer border-2 rounded-sm  text-slate-500">Search</button>
      </div>



      <div className="main ">
        <div className="mx-auto rounded-lg overflow-hidden ">
          <div className="md:flex">
            <div className="w-full p-3">
              <div
                className="relative min-h-[30vh] lg:h-[40vh] lg:w-[30vw] w-[90vw] md:w-[50vw]  rounded-lg border-2 border-blue-500 bg-gray-50 py-10 flex justify-center items-center "
              >
                <div className="absolute flex flex-col items-center">
                  {
                    !Preview && !searchPreview && !isImageLoading && (
                      <img
                        alt="File Icon"
                        className="mb-3"
                        src="https://img.icons8.com/dusk/64/000000/file.png"
                      />
                    )
                  }
                  {
                    isImageLoading && <div className=" flex-col gap-4 w-full flex items-center justify-center">
                      <Spinner />
                    </div>
                  }
                  {
                    Preview && <div className="preview overflow-hidden px-5 py-5 h-full flex justify-center items-center w-[50vw] lg:w-[60vw]">

                      <img src={Preview} className=" max-h-[29vh] lg:max-w-[40vw]  max-w-[80vw] rounded-md " alt="" />


                    </div>
                  }
                  {
                    searchPreview && searchPreview != null && <div className="preview px-5 py-5 h-full flex justify-center overflow-hidden items-center w-[50vw]">

                      <img src={searchPreview} className=" max-h-[29vh] lg:max-w-[40vw] max-w-[80vw] rounded-md " alt="" />


                    </div>
                  }

                  {
                    !Preview && !searchPreview && !isImageLoading && (
                      <span className="block text-gray-500 font-semibold"
                      >Drag &amp; drop your Photo here</span>
                    )
                  }
                  {
                    !Preview && !searchPreview && !isImageLoading && (
                      <span className="block text-gray-400 font-normal mt-1"
                      >or click to upload</span>
                    )
                  }

                  {
                    !Preview && !searchPreview && !isImageLoading && (
                      <span className="block text-gray-500 text-xs mt-1"> *image only</span>
                    )
                  }
                  {
                    searchPreview && <p className="text-xs text-neutral-500">* Click Here to Upload Again</p>

                  }



                </div>

                <input
                  name=""
                  className="min-h-[30vh] w-[90vw] opacity-0 cursor-pointer"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                />
              </div>
            </div>
          </div>
        </div>

      </div>



      {
        isUploading ? <div className="spin mt-20"><Spinner /></div> : !isUploading && !searchPreview && !ID && <button onClick={sendImage} className="bg-[#F9FAFB] lg:w-[10vw] md:w-[50vw] w-[90vw] text-center border-blue-500  hover:bg-blue-300 py-2 cursor-pointer border-2 rounded-sm  text-slate-500">Upload</button>
      }



      {
        ID && <h1 className="text-black font-semibold flex flex-col gap-2 justify-center items-center tracking-wider">Use The Code <span className="font-bold tracking-widest text-lg bg-neutral-800 text-white px-10 py-2">{`${ID}`}</span><span className="text-black font-semibold flex flex-col justify-center items-center tracking-wider">to download this Image</span></h1>
      }

      {
        searchPreview && <button onClick={() => downloadImage(searchPreview)} className="bg-[#F9FAFB] lg:w-[30vw] md:w-[50vw] w-[60vw] text-center hover:bg-blue-300 border-blue-500 py-2 cursor-pointer border-2 rounded-sm  text-slate-500">Download</button>
      }


      <footer className=" absolute lg:bottom-5 bottom-2">

        <h1 className="bg-neutral-50 px-10 py-2 lg:w-[50vw] text-sm lg:text-md lg:font-semibold text-center tracking-wide text-neutral-700 rounded-sm border-b-4  shadow-2xl">Designed and Developed with ❣️ by Binod</h1>

      </footer>






    </div>
  );
}