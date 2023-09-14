import * as tf from '@tensorflow/tfjs';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useApi } from 'arweave-wallet-kit';
import { createTransaction, signTransaction, postTransaction } from 'arweavekit/transaction'
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../services/state/contexts/GlobalState';
import { TENSOR_LABELS, buildAtomicAssetTags, parseBase64Tx } from '../../../utils';
import ReactJson from 'react-json-view'
import { Button } from '@radix-ui/themes';
import Arweave from 'arweave';
import { set } from 'lodash';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

function Home() {
  const [{ walletAddress, txCache }, dispatchGlobalState] = useGlobalState();
  const walletApi = useApi();
  const [model, setModel] = useState<tf.GraphModel>();
  const [confidence, setConfidence] = useState<number | null>(null);
  const [atomicAsset, setAtomicAsset] = useState<any>(null);
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deployingAsset, setDeployingAsset] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<{[x:string]: any}>({});

  useEffect(() => {
    const history = txCache.getAllTransactions();
    setTransactionHistory(history);
    const loadModel = async () => {
      const model = await tf.loadGraphModel(
        '/models/imagenet_mobilenet_v2_100_128_classification_2_default_1/model.json',
      );
      setModel(model);
    };
    loadModel();
  }, []);

  const handleClasses = async (file: any) => {
    try {
      if (model) {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        await image.decode();

        const tensor = tf.browser
          .fromPixels(image)
          .resizeNearestNeighbor([128, 128])
          .toFloat()
          .expandDims();

        const predictions = model.predict(tensor) as tf.Tensor;
        const predictionsArray: number[][] =
          predictions.arraySync() as number[][];

        // You would need to map the topPrediction to the actual class name using a list of class names
        const classesArray = predictionsArray[0]
          .map((prediction, index) => {
            if (!Object.values(TENSOR_LABELS)[index]?.at(-1)) {
              return;
            }
            return {
              className: Object.values(TENSOR_LABELS)[index].at(-1),
              probability: prediction,
            };
          })
          .filter((prediction) => prediction !== undefined);

        if (!classesArray) {
          return;
        }

        return {
          classes: classesArray
          .sort((a, b) => b!.probability - a!.probability)!
          .slice(0, 9),
        imageBlob: new Blob([file], { type: file.type })
      }
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function handleImageChange(file: File) {
    if (!file) {
      setConfidence(null);
    }

    if (file) {
      setLoading(true);

      const result = await handleClasses(file);

      if (!result) {
        return;
      }
      const { classes, imageBlob } = result;

      const asset = buildAtomicAssetTags({
        fileName: file.name,
        description: file.name,
        title: file.name,
        creator: walletAddress ?? '',
        fileType: file.type,
        collectionCode: 'AI Powered Permaweb',
        license: 'MIT',
        fee: 0,
        commercialUse: true,
        topics: classes?.map(
          (prediction: any) => prediction.className,
        ) as string[],
      });

      setAtomicAsset(asset);
      setConfidence(confidence);
      setFile(imageBlob);
      setLoading(false);
    }
  }

  async function handleDeploy () {

    try {
      setDeployingAsset(true)
 if (!walletAddress) {
        throw new Error('No wallet address found')
      }

      console.log(file)

      const transaction = await createTransaction({
        type:"data",
        environment:"mainnet",
        data: await file.arrayBuffer(),
        options:{
        tags: atomicAsset
        }
      })
    

    await signTransaction({
        environment:"mainnet",
        createdTransaction:transaction,
      })

      const transactionId = await postTransaction({
        environment:"mainnet",
        transaction:transaction
      })

      if (!transactionId) {
        throw new Error('No transaction id found')
      }

      txCache.addTransaction(transactionId.transaction.id, JSON.parse(JSON.stringify(transaction)))

  
    } catch (error:any) {
      alert(error?.message)
      console.error(error)
    } finally {
      setDeployingAsset(false)
    }

  }

  return (
    <div className="page flex flex-column" style={{ padding: '30px 5%', maxWidth:"100%", boxSizing:"border-box" }}>
      <div
        className="flex flex-column"
        style={{ color: 'white', height: '100%',  overflow:"hidden", boxSizing:"border-box", maxWidth:"100%" }}
      >
        <div className="flex flex-row" style={{gap:"20px"}}>
          <div className="flex flex-column align-center justify-center" style={{flex: 1, border:"silver solid 2px", borderRadius:"7px", height:"100%", padding:"20px 30px", gap:"30px"}}>
          <Upload.Dragger 
          onChange={(file)=>{
            console.log(file)
             handleImageChange(file.file as any)
            }}
          listType='picture-card'
          beforeUpload={()=> false}
          >
            <div style={{color:"white", fontSize:"20px", padding:"100px 200px"}}>
    <p>
      <InboxOutlined style={{fontSize:"35px", color:"gold"}} />
    </p>
    <p>Click or drag file to this area to upload</p>
    <p>
      Support for a single image upload only.
    </p>
    </div>
  </Upload.Dragger>

            <div className='flex flex-column' style={{gap:"20px", padding:"10px"}}>
              {
              atomicAsset?.map((tag:any, index:number)=> (
                <div key={index} className='flex flex-row' style={{
                  gap:"10px",
                  padding:"10px",
                  border:"silver solid 2px",
                  borderRadius:"7px",
                  backgroundColor:"rgb(0,0,0,0.5)"

                }}>
                 <span style={{color:"grey"}}>{tag.name}</span>
                 <span style={{color:"white"}}>{
                  tag.name === 'Init-State' ? <ReactJson
                  src={JSON.parse(tag.value)}
                  theme={'ashes'}
                  /> :
                 tag.value
                 }</span>
                </div>
              ))
              }
            </div>
            <Button style={{fontSize:"30px", padding:"30px", width:"100%"}} onClick={()=> handleDeploy()}>
              Deploy AI tagged asset
            </Button>
          </div>
          <div className="flex flex-column align-center" style={{flex: 1, border:"silver solid 2px", borderRadius:"7px", padding:"20px 30px", gap:"30px",  overflow:"hidden", boxSizing:"border-box"}}>
            <h2 style={{position:"relative"}}>
              Transaction History
              <Button variant='outline' onClick={()=>{
                const history = txCache.getAllTransactions();
                setTransactionHistory(history);
              }} style={{position:"absolute", bottom:"0px", top:"0px", right:"-145px"}}>Refresh</Button>
            </h2>
            <div className='flex flex-column' style={{gap:"20px", padding:"10px", boxSizing:"border-box"}}>
              {
              Object.entries(transactionHistory).map(([txid, txbody], index)=>{
                console.log(txbody)
                
                return (
                <div key={index} className='flex flex-column' style={{
                  gap:"10px",
                  padding:"10px",
                  border:"silver solid 2px",
                  borderRadius:"7px",
                  backgroundColor:"rgb(0,0,0,0.5)"

                }}>
                 <span style={{color:"grey"}}>{txid}</span>
                 <span style={{color:"white"}}>
                <ReactJson 
                src={{...txbody, data:undefined, signature:undefined}} 
                theme={"ashes"}
                style={{maxWidth:"500px"}}
                
                />
                 </span>
                </div>
              )})
              }
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
