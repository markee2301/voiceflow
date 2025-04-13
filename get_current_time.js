export default async function main(args) {
  const { timezone } = args.inputVars;

  if (!timezone) {
    return {
      next: { path: 'error' },
      trace: [{ type: "debug", payload: { message: "Missing timezone" } }]
    };
  }

  try {
    const date = new Date();
    const options = { 
      timeZone: timezone, 
      weekday: 'long',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(date);

    const dayOfWeek = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(date);

    return {
      outputVars: {
        current_date: formatted,
        day_of_week: dayOfWeek,
        timezone: timezone,
      },
      next: { path: "success" },
      trace: [
        {
          type: "debug",
          payload: {
            message: `Successfully generated local time: ${formatted}, day: ${dayOfWeek}, timezone: ${timezone}`,
          },
        },
      ],
    };
  } catch (error) {
    return {
      next: { path: "error" },
      trace: [{ type: "debug", payload: { message: "Error: " + error.message } }],
    };
  }
}
