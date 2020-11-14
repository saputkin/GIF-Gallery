import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import StopIcon from '@material-ui/icons/Stop';
import axios from 'axios';
import './App.css';
import Gallery from './Gallery'




function SearchBox(props){
  const [val, setVal] = useState('');
  
  function handleSubmit(event){
    props.handleSubmit(val);
    setVal('');
    event.preventDefault();
  }
  return(
    <form onSubmit={handleSubmit}>
      <label>
       Random GIF Search:
        <input type="text" value={val || ''} onChange={(event) => setVal(event.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  )
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const useComponentDidMount = func => useEffect(func, []);

function App() {

  const [queries, setQueries] = useState([])
  const [gifs, setGifs] = useState([])
  const [intervals, setIntervals] = useState([])
  const[queryCounter, setQueryCounter] = useState(-1);



  useComponentDidMount(async () => {
    await axios.get("http://localhost:9000/refresh")
    .then(res =>{
      if(res.status !== 200)
        return;
      setGifs(res.data.gifs);
      setQueries(res.data.queries);
      res.data.queries.forEach(newQuery => {
      const interval = setInterval(() => {
        reqRandomGIF(newQuery);
        }, newQuery.interval * 1000);
            setIntervals(intervals => [...intervals, {'key': newQuery.key, 'interval':interval}])
          })
    })
  })
  useEffect(() => {
    if(queries.length > 0){
      var newQuery = queries.slice(-1)[0];
      const interval = setInterval(() => {
      reqRandomGIF(newQuery);

      }, newQuery.interval * 1000);
        setIntervals(intervals => [...intervals, {'key': queryCounter, 'interval':interval}])
    }
// eslint-disable-next-line
  }, [queryCounter])

  //TODO Remove intervals at unmount

  async function reqRandomGIF(query){
    //maybe change endpoint to save users images in serverside.
    await axios.post("http://localhost:9000/getRandomGIF", {'query':query.query, 'key':query.key})
    .then(res =>{
      console.log(res)
        setGifs( curGifs => [...curGifs, res.data])
    })
  }

  async function handleSubmit(val){
    
    var regexStr = val.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g);
    if(regexStr.length <= 1){
      return;
    }
    var query = regexStr.slice(0, -1).join(' ');
    
    if(!isNumeric(regexStr.slice(-1)[0]))
      return;
    const interval = parseInt(regexStr.slice(-1)[0])
    
    await axios.post("http://localhost:9000/submitQuery", {'query':query,'interval':interval,'key':queryCounter + 1})
    .then(res =>{
        setGifs(curGifs => [...curGifs, res.data])
        setQueries(curQueries => [...curQueries , {'key':queryCounter + 1, 'query':query, 'interval': interval}]);
        setQueryCounter(queryCounter => queryCounter + 1)

    })
  
  }

  async function removeGifsAndJob(q){
    //remove job
    // const intervalToRemove = intervals.find( cur => cur.key === q.key)
    const  intervalToRemove = intervals.find( cur => cur.key === q.key)
    await axios.post("http://localhost:9000/removeJob", {'job':q})
    .then(res => {
        clearInterval(intervalToRemove.interval);
        setIntervals(intervals => intervals.filter(cur => cur.key !== q.key))
        setGifs(gf => res.data.gifs);
        setQueries(qs => res.data.queries);
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <SearchBox handleSubmit={handleSubmit} />
        {queries.length > 0 &&
        queries.map((q) => {return (<Button variant="contained" size="small"
                                            color="primary"
                                            endIcon={<StopIcon />}key={q.key} onClick= {() => removeGifsAndJob(q)}>{q.query +' ' + q.interval}</Button>)} )}
      </header>
      <div className="gallery-root" >
      <Gallery gifs={gifs}/>
      </div>
    </div>
  );
}

export default App;
