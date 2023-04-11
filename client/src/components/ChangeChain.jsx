import { Box } from '@mui/material';

const ChangeChain = ({ chain }) => {

    return (


        <div style={{
            position: 'absolute',
            top: '40%',
            left: '27%',
        }}>
            <Box className="modal-main-content">
                <label className="modal-information-title generic-text-font1-uppercase generic-text-color-white">
                    Wrong kingdom
                </label>
                <label className="modal-information-text generic-text-font generic-text-color" style={{ marginTop: '10px' }}>
                    Guardian, you need to travel to the {chain} kingdom to access this section
                </label>
            </Box>
        </div>
    )
}

export default ChangeChain