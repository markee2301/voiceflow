export default async function main(args) {
  // Extracting input variables
  const { last_utterance, last_response, previous_custom_memory } = args.inputVars;

  // Preparing a debug message to mimic logging behavior
  let custom_memory = previous_custom_memory || "";

  custom_memory += `Our company: ${last_response}\nUser: ${last_utterance}\n`;

  // Echo back the first key value along with a debug message
  return {
    next: { path: "success" }, // Directing the flow to continue on the 'success' path

    outputVars: {
      custom_memory: custom_memory,
    },

    trace: [
      {
        type: "debug",
        payload: {
          message: `Custom memory = ${custom_memory}`,
        },
      },
    ],
  };
}
