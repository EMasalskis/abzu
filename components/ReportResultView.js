import React from 'react'
import { ColumnTransformersJSX } from '../models/columnTransformers'

class ReportResultView extends React.Component {


  render() {

    const { results, activePageIndex, columnOptions } = this.props

    const paginatedResults = getResultsPaginationMap(results)
    const resultItems = paginatedResults[activePageIndex] || []

    const columnStyle = {
      flexBasis: '100%',
      textAlign: 'left',
      marginLeft: 4,
      marginTop: 2,
      marginBottom: 2
    }

    const columnStyleHeader = {
      ...columnStyle,
      marginLeft: 0,
    }

    const columns = columnOptions.filter( c => c.checked).map( c => c.id )


    return (
      <div>
        <div style={{marginLeft: 5, fontWeight: 600, fontSize: 12, textAlign: 'center', marginBottom: 10, marginTop: 10}}>
          Showing 20 of { results.length } results 
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', lineHeight: '1.5'}}>
          <div key={'column-header'} style={{display: 'flex', fontWeight: 600, paddingLeft: 10}}>
            { columns.map( column => (
              <div key={"column-" + column} style={columnStyleHeader}>{ column }</div>
            ))
            }
          </div>

          { resultItems.map( (item, index) => {

            const background = index % 2 ? 'rgba(213, 228, 236, 0.37)' : '#fff'

            return (
              <div key={item.id} style={{display: 'flex', background: background, padding: '0px 10px'}}>
                { columns.map( column => (
                  <div key={"column-item-" + column} style={columnStyle}>{ ColumnTransformersJSX[column](item) }</div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

// Navn, modalitet, ID, Imported ID, Fylke, Kommune, Lat, long


const getResultsPaginationMap = results => {
  if (!results || !results.length) return []

  let paginationMap = []
  for (let i = 0, j = results.length; i < j; i+=20) {
    paginationMap.push(results.slice(i,i+20))
  }
  return paginationMap
}

export default ReportResultView