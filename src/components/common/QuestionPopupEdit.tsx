import { useState , useRef, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import {Form, Row, Col,Button, Card, InputGroup} from 'react-bootstrap';
import MapCountryloader from './MapCountries';
import Maploader from './Map';
import {  Question } from '../../interfaces';

interface Props{
    buttonText?: string;
    oldQuestion?: Question;
    id?:string;
    addQuestion?: (newQuestion: Question, updateId?: string) => void;
}

interface error {
  answer?: string;
  question?: string;
}

function QuestionPopupEdit({buttonText="Popup Edit" , addQuestion, oldQuestion, id}: Props) {
  const [show, setShow] = useState(false);
  const [selectedMapMode, setSelectedMapMode] = useState<string | null>(oldQuestion?.MapMode ?? null);
  const [selectedLocation, setSelectedLocation] = useState<string[] | number[] | null>(oldQuestion?.Answer ?? null);
  const [selectedpointsArea, setSelectedpointsArea] = useState<number | null>(oldQuestion?.PointRange ?? null);
  const [errors, setErrors] = useState<error>({answer: "",question: ""});
  
  const mapModeRef = useRef(null);
  const questionRef = useRef<HTMLInputElement>(null);
  const formRef = useRef(null);
  


  const handleSliderValue = (e) => {
    setSelectedpointsArea(Number(e.target.value));
  };

  useEffect(() => {
    if(errors.answer){
      const validAnswer = validateAnswer();
      setErrors({answer :validAnswer, question: errors.question});
    }
      
  }, [selectedLocation]);


  const handleClose = () =>{ 
    setShow(false)
    if(!id){
      setSelectedLocation(null);
      setSelectedMapMode(null);
      setSelectedpointsArea(null);
      // setShowMap(false);
    }
  };
  const handleShow = () => setShow(true);

  const updateMapMode = (mapMode: string) => {
    setSelectedMapMode(mapMode);
  };
 
  function validateAnswer(){
    if (selectedLocation){
      if (typeof selectedLocation === 'string'){
        if (selectedMapMode === "country"){
          return ;
        }else{
        //setErrors({answer: "Please select a valid answer"});
        return "Please select a valid answer";
        }
      }else if(selectedMapMode === "marker"){
        //console.log("valid marker answer");
        //setErrors({answer: ""});
        return ;
      }else {
        //setErrors({answer: "Please select a valid answer"});
        return "Please select a valid answer";
      }
    }else {
      //setErrors({answer: "Please select an answer"});
      return "Please select an answer";
    }
  }

  function validateQuestion(){
    if(questionRef.current && questionRef.current.value.length > 0 ){
      return ;
    }
    else 
      return "Required"
  }

  function isvalidateQuestion(){
    const validQuestion = validateQuestion();
    setErrors({answer :errors.answer, question: validQuestion});
  }

  const submitQuestion = () => {
    const validAnswer = validateAnswer();
    const validQuestion = validateQuestion();
    setErrors({answer :validAnswer,question: validQuestion});
    if(!validAnswer && !validQuestion){
      let pointRangeval;
      if (selectedMapMode === "marker"){
        pointRangeval = selectedpointsArea
      }
        //validAnswer = null;
      if(selectedLocation && mapModeRef.current && questionRef.current && addQuestion){
        addQuestion(
          { 
            Answer: selectedLocation, 
            MapMode: mapModeRef.current?.value, 
            Question: questionRef.current?.value, 
            ...(pointRangeval ? {PointRange: pointRangeval}:{})
            },
            id ?? undefined // Pass undefined when id is not defined
        );
      }
        handleClose(); 
    }
  }

  const manualSliderInput = (e) => {
    handleSliderValue(e);
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        {buttonText}
      </Button>
      <div > {/* Fix centering here on y, idk why this doesnt work */}
      <Modal show={show} onHide={handleClose} dialogClassName="custom-modal" centered>
        <Modal.Header closeButton>
          <Modal.Title>Question Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form ref={formRef}>
                <InputGroup>
                    <InputGroup.Text className={errors.question ? 'border border-danger':""}>Question</InputGroup.Text>
                    <Form.Control 
                      className={errors.question ? 'border border-danger':""} 
                      as="textarea" aria-label="With textarea" 
                      ref={questionRef} 
                      defaultValue={oldQuestion?.Question || ""} 
                      onChange={()=> {console.log("selectedlocation: "+selectedLocation+"\noldLocation: "+oldQuestion?.Answer)}} 
                      onBlur={() => isvalidateQuestion()}
                      required
                    />
                </InputGroup>
                {errors.question && <p className='text-danger'>{errors.question}</p>}
                
                  <InputGroup>
                    <InputGroup.Text>Map Mode</InputGroup.Text>
                    <Form.Select aria-label="Map type selector" ref={mapModeRef} defaultValue={oldQuestion?.MapMode || "None"} onChange={(event) => updateMapMode(event.target.value)} required>
                        <option disabled value="None">None</option>
                        <option value="country">Country</option>
                        <option value="marker">Marker</option>
                    </Form.Select>
                  </InputGroup>
                { selectedMapMode && (
                  selectedMapMode === "country" ? 
                  <>
                  <Card style={{display: "flex", height: "40vh"}}>
                    {/* <CloseButton onClick={() => setShowMap(false)}/> */}
                    <MapCountryloader addSelectedLocation={setSelectedLocation} oldSelection={oldQuestion?.Answer}/>
                  </Card>
                  </>
                  
                  : 
                  ( selectedMapMode === "marker" ? 
                  <>
                   <Card style={{display: "flex", height: "40vh"}}>
                    {/* <CloseButton onClick={() => setShowMap(false)}/> */}
                    <Maploader addSelectedPin={setSelectedLocation} mapMode={"Edit"} pointsArea={selectedpointsArea} oldSelection={oldQuestion?.Answer}/>
                  </Card>

                  <Form.Group as={Row} className="g-2 align-items-center">
                      <InputGroup>
                          <InputGroup.Text>Range</InputGroup.Text>
                          <Col xs={8} className="d-flex align-items-center border">
                            <Form.Range 
                              className="flex-grow-1 p-2"
                              value={selectedpointsArea ? selectedpointsArea : setSelectedpointsArea(1)} 
                              onChange={manualSliderInput}
                              max={500000}
                            />

                        </Col>

                        <Form.Control 
                          value={selectedpointsArea}
                          onChange={manualSliderInput}
                        />
                      </InputGroup>
                    </Form.Group>

                  </>
                  : null
                )
              )
            }

            {
              <>
                <InputGroup>
                  <InputGroup.Text className={errors.answer ? 'border border-danger':""}>Current Answer</InputGroup.Text>
                  <Form.Control className={errors.answer ? 'border border-danger':""}
                    readOnly
                    value={selectedLocation}
                    required

                    />
                </InputGroup>
                {errors.answer && 
                <p className='text-danger'>{errors.answer}</p>}
              </>
            }

            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={submitQuestion}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </>
  );
}

export default QuestionPopupEdit;