import { Stack, Typography } from "@mui/material";

const NotConnected = () => {
  return (
    <Stack className="div-centered" direction="column">
      <Typography variant="h6">Not connected</Typography>
      <Typography variant="subtitle1">
        Guardian, you need to connect to accesss this section.
      </Typography>
    </Stack>
  );
};

export default NotConnected;
