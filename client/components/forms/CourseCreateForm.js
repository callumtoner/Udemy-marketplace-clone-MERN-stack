import { Select, Button, Avatar, Badge } from 'antd'; 
import create from '../../pages/instructor/course/create'

const { Option } = Select;



const CourseCreateForm = ({
    handleImage,
    handleSubmit,
    handleChange, 
    values, 
    setValues,
    preview,
    uploadButtonText,
    handleImageRemove,
    editPage = false,
}) => {

    const children =[]; 
    for (let i=1.99; i <= 99; i++) {
        children.push(<Option key={i.toFixed(2)}>${i.toFixed(2)}</Option>)
    }

    return (
        <>
        {values && (<form onSubmit= {handleSubmit}>
    <div className="form-group">
        <input type="text" name="name" className="form-control" placeholder="Name" value={values.name} onChange={handleChange} />
    </div>
   
    <div className="pt-3">
        <textarea name="description" cols="7" rows="7" value={values.description}  className="form-control" onChange={handleChange}></textarea>
    </div>
    
    <div className="form-row pt-3">
        <div className="col">
            <div className="form-group">
                    <Select value={values.paid} style={{ width: "100% "}} size="large" onChange={(v) => setValues({...values, paid: v, price: 0 })}>
                        <Option value={true}>paid</Option>
                        <Option value={false}>free</Option>

                    </Select>
            </div>
        </div>

        {values.paid && (
            <div className="form-group mt-3">
                <Select defaultValue="$9.99" style={{width: '100%'}} onChange={(v) => setValues({ ...values, price : v })} tokenSeparators={[,]} size="large">
                        {children}
                </Select>
            </div>
        )}

    </div>

    <div className="form-group mt-3">
        <input type="text" name="category" className="form-control" placeholder="category" value={values.category} onChange={handleChange} />
    </div>

    <div className="form-row mt-3">
        <div className="col">
            <div className="form-group">
                <label className="btn btn-outline-secondary btn-block text-left">
                   {uploadButtonText}
                    <input type="file" name="image" style={{width: '100%'}} onChange={handleImage} accept="image/*" hidden />
                </label>
            </div>
        </div>

        {preview && <Badge count="X" onClick={handleImageRemove} className="pointer">
            <Avatar className="mt-3" height={900} width={900} src={preview}/>
                    </Badge> }

           {editPage && <Avatar width={200} src={values.image.Location}  />}         
    </div>

    <div className="row mt-3" >
        <div className="col"  >
            <Button onClick={handleSubmit} type="submit" size="large" shape="round" loading={values.loading} disabled={values.loading || values.uploading} className="btn btn-primary" >{values.loading ? 'Saving...' : 'Save & Continue'}</Button>
        </div>
    </div>

</form>)}
        </>
    )
}


export default CourseCreateForm; 