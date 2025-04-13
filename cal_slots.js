export default async function main(args) {
  const { startTime, endTime, apiKey, eventTypeId, timezone } = args.inputVars;

  // Get the eventTypeSlug from the eventTypeId (you might need to provide this as an input var as well)
  const eventTypeSlug = args.inputVars.eventTypeSlug;

  // Input validation
  if (!startTime || !endTime || !apiKey || !eventTypeId || !eventTypeSlug || !timezone) {
    return {
      next: { path: 'error' },
      trace: [{ type: "debug", payload: { message: "Missing required parameters" } }]
    };
  }

  try {
    // Use v2 API endpoint
    const url = `https://api.cal.com/v2/slots/available?startTime=${startTime}&endTime=${endTime}&eventTypeId=${eventTypeId}&eventTypeSlug=${eventTypeSlug}`;
    
    // Configuration with Bearer token
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseBody = response.json;

    // Validate the responseBody
    if (!responseBody || typeof responseBody !== 'object') {
      throw new Error("Invalid or missing response body from the API");
    }

    // Check for API success status
    if (responseBody.status !== "success") {
      throw new Error(`Cal.com returned error "${JSON.stringify(response)}"`);
    }

    // Extract and check slots
    const slots = responseBody?.data?.slots || {};
    const hasAvailability = Object.values(slots).some(dateSlots => dateSlots.length > 0);

    if (!hasAvailability) {
      return {
        next: { path: 'no_availability' },
        trace: [{ type: "text", payload: { message: "No available slots found." } }]
      };
    }

    // Convert slots to specified timezone
    const convertedAvailability = {
      ...responseBody,
      data: {
        slots: Object.fromEntries(
          Object.entries(slots).map(([date, slotArray]) => [
            date,
            slotArray.map(slot => ({
              time: new Date(slot.time).toLocaleString("en-US", { timeZone: timezone })
            }))
          ])
        )
      }
    };

    return {
      outputVars: {
        converted_availability: JSON.stringify(convertedAvailability)
      },
      next: { path: 'success' },
      trace: [
        {
          type: "debug",
          payload: { message: "Available times received and converted" }
        }
      ]
    };

  } catch (error) {
    return {
      next: { path: "error" },
      trace: [{ 
        type: "debug", 
        payload: { 
          message: "Error: " + error.message 
        } 
      }],
    };
  }
}
