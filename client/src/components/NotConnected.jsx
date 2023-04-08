import { Box } from '@mui/material';

const NotConnected = () => {

    return (


        <div style={{
            position: 'absolute',
            top: '40%',
            left: '35%',
        }}>
            <Box className="modal-main-content">
                <label className="modal-information-title generic-text-font1-uppercase generic-text-color-white">
                    Not connected
                </label>
                <label className="modal-information-text generic-text-font generic-text-color" style={{ marginTop: '10px' }}>
                    Guardian, you need to connect to accesss this section
                </label>
            </Box>
        </div>
    )
}

export default NotConnected