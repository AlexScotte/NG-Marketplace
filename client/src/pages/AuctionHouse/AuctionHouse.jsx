import { DataGrid } from '@mui/x-data-grid';
// import { createStyles, makeStyles } from "@material-ui/core/styles";

const AuctionHouse = () => {

    // const classes = useStyles();

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First name', width: 130 },
        { field: 'lastName', headerName: 'Last name', width: 130 },
        {
            field: 'age',
            headerName: 'Age',
            type: 'number',
            width: 90,
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            valueGetter: (params) =>
                `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },
    ];

    const rows = [
        { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
        { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
        { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
        { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
        { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
        { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
    ];

    const handleRowClick = (param, event) => {
        console.log("Row:");
        console.log(param);
        console.log(event);
    };


    // const useStyles = makeStyles((theme) =>
    //     createStyles({
    //         root: {
    //             '& div[data-rowIndex][role="row"]:nth-of-type(5n-4)': {
    //                 color: "Red",
    //                 fontSize: 18,
    //                 //risky
    //                 minHeight: "60px !important",
    //                 height: 60,
    //                 "& div": {
    //                     minHeight: "60px !important",
    //                     height: 60,
    //                     lineHeight: "59px !important"
    //                 }
    //             },
    //             "& .MuiDataGrid-renderingZone": {
    //                 "& .MuiDataGrid-row": {
    //                     "&:nth-child(2n)": { backgroundColor: "rgba(235, 235, 235, .7)" }
    //                 }
    //             }
    //         }
    //     })
    // );

    return (
        // <div style={{
        //     backgroundImage: `url("https://nodeguardians.io/_next/image?url=%2Fassets%2Ftextures%2Fbackground-2.webp&w=1800&q=100")`,
        //     backgroundRepeat: "no-repeat",
        //     backgroundSize: "cover",
        //     height: '100vw',
        //     width: '100vw'
        // }}>
        <div className="labelStyle">
            Auction House

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    // className={classes.root}
                    rows={rows}
                    columns={columns}
                    // pageSize={5}
                    // rowsPerPageOptions={[5]}
                    onRowClick={handleRowClick}
                    rowHeight={120}
                    sx={{
                        // HEADER STYLE
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "rgba(0,0,255,0.6)",
                            color: "rgba(255,0,0,0.7)",
                            fontSize: 16
                        },

                        '& div[data-rowIndex][role="row"]:nth-of-type(n)': {
                            color: "blue",
                            fontSize: 18,
                            //risky sizing code starts here
                            minHeight: "60px !important",
                            height: 60,
                            "& div": {
                                minHeight: "60px !important",
                                height: 60,
                                lineHeight: "59px !important"
                            }
                        },
                        // "& .MuiDataGrid-virtualScrollerRenderZone": {
                        //     "& .MuiDataGrid-row": {
                        //         "&:nth-child(2n)": { backgroundColor: "rgba(235, 235, 235, .7)" }
                        //     }
                        // }
                    }}
                />
            </div>
        </div>


    )
}

export default AuctionHouse