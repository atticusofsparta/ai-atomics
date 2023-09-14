import { ATOMIC_ASSET_SOURCE } from './constants';

export * from './constants';


export function buildAtomicAssetTags ({
    fileName,
    fileType,
    title,
    collectionCode,
    creator,
    license,
    fee,
    commercialUse,
    topics,
    description
}:{
    fileName: string,
    fileType: string,
    title: string,
    collectionCode:string,
    creator:string,
    license:string,
    fee:number,
    commercialUse:boolean,
    topics:string[],
    description:string
}) {

   return [
        {name: "model", value: "imagenet_mobilenet_v2_100_128_classification_2_default_1"},
        { name: 'Content-Type', value: fileType },
         { name: 'App-Name', value: 'SmartWeaveContract'},
         { name: 'App-Version', value: '0.3.0'},
         { name: 'Contract-Src', value: ATOMIC_ASSET_SOURCE},
         { name: 'Contract-Manifest', value: '{"evaluationOptions":{"sourceType":"redstone-sequencer","allowBigInt":true,"internalWrites":true,"unsafeClient":"skip","useConstructor":true}}'},
         { name: 'Init-State', value: JSON.stringify({
           balances: {
             [creator]: 1
           },
           name: title,
           description,
           ticker: fileName.toUpperCase(),
           claimable: []
         })},
         { name: 'Title', value: title },
         { name: 'Description', value: description.slice(0, 100) },
         { name: 'Type', value: "asset" },
         { name: 'Indexed-By', value: 'ucm'},
         { name: "License", value: license},
         { name: "Access", value: "restricted"},
         { name: "Access-Fee", value: `One-Time-${fee}` },
         { name: "Derivation", value: "allowed-with-license-fee" },
         { name: "Derivation-Fee", value: `One-Time-${fee * 3}` },
         { name: "Commercial-Use", value: commercialUse ? "allowed" : "not-allowed" },
         { name: "Commercial-Free", value: `One-Time-${fee * 10}` },
         { name: "Payment-Mode", value: "Global-Distribution" },
         { name: "Collection-Code", value: collectionCode },
         ...(topics.map(topic => ({ name: "topic" + ':' + topic, value: topic })))
   ]

}



export function parseBase64Tx(b64String:string) {
  try {
    // Validate the base64 string
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b64String)) {
      throw new Error('Invalid base64 string');
    }

    // Step 1: Decode the base64 string
    const decodedString = atob(b64String);

    // Step 2: Convert the decoded string to an ArrayBuffer
    const uint8Array = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
      uint8Array[i] = decodedString.charCodeAt(i);
    }
    const arrayBuffer = uint8Array.buffer;

    // Step 3: Convert the ArrayBuffer to a string
    const stringFromBuffer = new TextDecoder('utf-8').decode(arrayBuffer);

    // Step 4: Parse the string to a JSON object
    const jsonObject = JSON.parse(stringFromBuffer);

    return jsonObject;
  } catch (error) {
    console.error('Error parsing base64 transaction:', error);
    throw error; // or return an error object, depending on your error handling strategy
  }
}