import { Mistral } from "@mistralai/mistralai"; const mistral = new Mistral({ apiKey: "test" }); console.log(mistral.chat); console.log(mistral.embeddings); console.log(Mistral.prototype);
