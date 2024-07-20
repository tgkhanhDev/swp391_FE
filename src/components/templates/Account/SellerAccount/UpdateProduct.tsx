import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useView } from '../../../../hooks/useView';
import { getCategoryThunk } from "../../../../store/viewManager/thunk";
import { getSellerInfoThunk } from "../../../../store/userManagement/thunk";
import { useAppDispatch } from '../../../../store/index';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Select, InputNumber, Input, Button, Form, FormProps } from 'antd';
import { toast } from "react-toastify";
import { useAccount } from "../../../../hooks/useAccount";
import { Option } from "antd/es/mentions";
import './index.css'
import FirebaseUpload from "../../../../../thirdparty/FirebaseUpload";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { imgDB, txtDB } from "../../../../../thirdparty/config";
import { v4 } from "uuid";
import { collection, getDocs } from "firebase/firestore";
import { createProductType } from "../../../../types/product";
import { createProductThunk } from "../../../../store/productManagement/thunk";

interface Category {
  variationDetailName: string;
}

interface Group {
  variationName: string;
  categories: Category[];
}

export const UpdateProduct = () => {
  const navigate = useNavigate();
  // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [user, setUser] = useState('');
  const { studentInfo } = useAccount();
  const { category } = useView();
  const dispatch = useAppDispatch();
  const [groups, setGroups] = useState<Group[]>([
    {
      variationName: '',
      categories: [{ variationDetailName: '' }],
    },
  ]);

  //!FB============
  const [txt, setTxt] = useState("");
  const [img, setImg] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [imgRender, setImgRender] = useState<any>([]);
  //!===============

  useEffect(() => {
    dispatch(getCategoryThunk());
  }, [dispatch]);

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    dispatch(
      getSellerInfoThunk({
        sellerTO: {
          RegisteredStudent: {
            Student: {
              studentId: studentInfo?.username
            }
          }
        }
      })
    )
      .then((action) => {
        const { payload } = action;
        const { data } = payload;
        setUser(data); // Kết hợp userInfo và data thành một đối tượng mới
      })
      .catch((error) => {
        console.error("Error fetching account information:", error);
      });

    if (!studentInfo) {
      navigate('/login');
    } else if (studentInfo.role !== "Seller") {
      navigate('/authorize');
    }
  }, []);

  useEffect(() => {
    if (user && (user.sellerTO?.active === 2 || user.sellerTO?.active === 0)) {
      navigate('/*');
    }
  }, [user, navigate]);

  const handleAddGroup = () => {
    if (groups.length < 2) { // Giới hạn tối đa 2 nhóm
      setGroups([...groups, { variationName: '', categories: [''] }]);
    } else {
      toast.warning('Chỉ được phép tạo tối đa 2 nhóm phân loại sản phẩm');
    }
  };

  const handleGroupNameChange = (index, value) => {
    const newGroups = [...groups];
    newGroups[index].variationName = value;
    setGroups(newGroups);
  };

  const handleAddCategory = (groupIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].categories.push('');
    setGroups(newGroups);
  };

  const handleCategoryChange = (groupIndex, categoryIndex, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex].categories[categoryIndex] = value;
    setGroups(newGroups);
  };

  const handleRemoveGroup = (groupIndex) => {
    const newGroups = [...groups];
    newGroups.splice(groupIndex, 1);
    setGroups(newGroups);
  };

  // Thêm hàm loại bỏ phân loại sản phẩm
  const handleRemoveCategory = (groupIndex, categoryIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].categories.splice(categoryIndex - 1, 1);
    setGroups(newGroups);

  };

  //!============================Submit


  const onFinish: FormProps<createProductType>['onFinish'] = async (values) => {
    values.studentId = studentInfo.username;

    values.productImageRequestsList = [];
    urls.map(imgUrl => {
      values.productImageRequestsList.push({ imageUrl: imgUrl })
    })

    // console.log('Success:', values);
    dispatch(createProductThunk(values)).then(() => {
      navigate(-1)
      toast.success("Tạo sản phẩm thành công!")
    });
  };

  const onFinishFailed: FormProps<createProductType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  //!============================

  //*getData from firebase
  const getData = async () => {
    const valRef = collection(txtDB, "txtData");
    const dataDb = await getDocs(valRef);
    const allData = dataDb.docs.map((val) => ({
      ...val.data(),
      id: val.id,
    }));
    setData(allData);
  };

  useEffect(() => {
    getData();
  }, []);

  //!====================================

  return (
    <Form
      name="basic"
      //labelCol={{ span: 8 }}
      //wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <main className='py-10'>
        <div className='pl-14'>
          <div className='font-bold text-4xl'>Tạo sản phẩm</div>
          <div className="py-10 pr-6">
            <div className="pb-10 pt-2 border-b-2 border-slate-300">
              <div className="text-2xl font-semibold mb-5">Thông tin cơ bản</div>
              <div className="mb-8">
                <label className='font-semibold'>Tên sản phẩm*</label>
                <Form.Item<createProductType>
                  name="productName"
                  className="w-full"
                  rules={[{ required: true, message: 'Vui lòng nhập sản phẩm!' }]}

                >
                  <Input className='border-slate-400 focus:outline-none text-gray-500 focus:text-black border px-4 py-2 h-10 w-full rounded-md mt-2 bg-white' />
                </Form.Item>
              </div>

              <div className="mt-8">
                <label className='font-semibold'>Miêu tả</label>
                <Form.Item<createProductType>
                  name="productDescription"
                  className="!w-full"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}

                >
                  <Input.TextArea className='border-slate-400 text-gray-500 focus:text-black focus:outline-none border px-4 py-2 h-24 w-full rounded-md mt-2 bg-white' />
                </Form.Item>
              </div>
            </div>

            <div className="pb-10 pt-6 border-b-2 border-slate-300">
              <div className="text-2xl font-semibold mb-5">Phân loại danh mục</div>
              <div className="mb-8">
                <label className='font-semibold mr-10'>Thể loại sản phẩm</label>
                <Form.Item<createProductType>
                  name="categoryId"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                  <Select
                    style={{ width: '100vh' }}
                    placeholder="Chọn danh mục">
                    {category.map(item => (
                      <Option key={item.categoryId + ''} value={item.categoryId + ''}>
                        {item.categoryName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {/* <Select
                  style={{ width: '100vh' }}
                >
                  {category.map(item => (
                    <Option key={item.categoryId + ''} value={item.categoryId + ''}>
                      {item.categoryName}
                    </Option>
                  ))}
                </Select> */}
              </div>

              <div className="mt-8">
                <div className='font-semibold text-xl mb-2'>Phân loại sản phẩm</div>
                {groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6 py-4 px-8 bg-gray-200">

                    <div className="mb-10">
                      <label className='font-semibold'>Tên nhóm phân loại sản phẩm {groupIndex + 1}</label>
                      {/* <Form.Item<createProductType>
                        name="productDescription"
                        className="!w-full"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}

                      > */}
                      <Form.Item<createProductType>
                        name={['variationList', groupIndex, 'variationName']}
                        className="!w-full"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                      >
                        <Input
                          type="text"
                          placeholder="Tên nhóm phân loại"
                          value={group.variationName}
                          onChange={(e) => handleGroupNameChange(groupIndex, e.target.value)}
                          className="border p-2 w-full px-4 py-2 border-slate-400 focus:outline-none rounded-md mt-2"
                        />
                      </Form.Item>
                    </div>
                    <div className="mb-5">
                      <label className='font-semibold'>Phân loại sản phẩm</label>
                      <div className="grid grid-cols-3 gap-10">
                        {group.categories.map((category, categoryIndex) => (
                          <div key={categoryIndex} className="flex items-center">
                            <Form.Item
                              name={['variationList', groupIndex, 'variationDetailRequestList', categoryIndex, 'description']}
                              className="w-full"
                              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                            >
                              <Input
                                type="text"
                                placeholder="Chi tiết phân loại"
                                value={category.variationDetailName}
                                onChange={(e) => handleCategoryChange(groupIndex, categoryIndex, e.target.value)}
                                className="border p-2 w-full px-4 py-2 border-slate-400 focus:outline-none rounded-md my-2"
                              />
                            </Form.Item>
                          </div>
                        ))}

                        <div className="grid grid-cols-2 items-start my-2">
                          {group.categories.length === 1 ? (
                            <button
                              className="flex items-center justify-center bg-[var(--color-primary)] text-white py-2 px-4 rounded w-full"
                              onClick={() => handleAddCategory(groupIndex)}
                              style={{ gridColumn: '1 / 3' }} // Spanning first two columns
                            >
                              Thêm &nbsp;<PlusOutlined />
                            </button>
                          ) : (
                            <div className="flex items-center justify-between w-full col-span-2">
                              <button
                                className="flex items-center justify-center bg-[var(--color-primary)] text-white py-2 px-4 rounded mr-2 w-full"
                                onClick={() => handleAddCategory(groupIndex)}
                              >
                                Thêm &nbsp;<PlusOutlined />
                              </button>

                              <button
                                className="flex items-center justify-center bg-white text-[var(--color-primary)] px-4 py-2 rounded ml-2 w-full"
                                onClick={() => handleRemoveCategory(groupIndex, group.categories.length - 1)} // Only one "Xóa" button for the last category
                              >
                                Xóa &nbsp;<DeleteOutlined />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                    {groups.length > 1 && (
                      <button
                        className="bg-white text-[var(--color-primary)] py-2 px-4 rounded w-full flex justify-center items-center"
                        onClick={() => handleRemoveGroup(groupIndex)}
                      >
                        Xóa nhóm phân loại sản phẩm &nbsp;<DeleteOutlined />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="bg-[var(--color-primary)] text-white py-2 px-4 rounded w-full flex justify-center items-center"
                  onClick={handleAddGroup}
                >
                  Thêm nhóm phân loại sản phẩm &nbsp;<PlusOutlined />
                </button>
              </div>
            </div>

            <div className="pb-10 pt-2 border-b-2 border-slate-300">
              <div className="text-2xl font-semibold mb-5">Thông tin cơ bản</div>
              <div className="mb-8">
                <label className='font-semibold'>Đơn giá (VNĐ)</label>
                {/*<input className='border-slate-400 focus:outline-none text-gray-500 focus:text-black border px-4 py-2 h-10 w-full rounded-md mt-2 bg-white' defaultValue='10.000'></input>*/}
                <Form.Item
                  name="price"
                  className="w-1/4"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                  <InputNumber
                    className='border-slate-400 focus:outline-none text-gray-500 focus:text-black border h-10 w-full rounded-md mt-2 bg-white flex items-center'
                    defaultValue={10000}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    // parser={value => value.replace(/đ\s?|(\,*)/g, '')}
                    step={1000}
                  />
                </Form.Item>
              </div>

            </div>

            <div className="flex justify-end mt-5 gap-x-5">
              <Button onClick={() => { navigate(-1) }} className="px-5 py-2 flex justify-center items-center text-lg">
                Hủy
              </Button>
              <Form.Item wrapperCol={{ offset: 0, span: 16 }} className="m-0">
                <Button htmlType="submit" type="primary" className="px-5 py-2 flex justify-center items-center text-lg">
                  Chỉnh sửa
                </Button>
              </Form.Item>
            </div>
          </div>
        </div>
      </main>
    </Form>
  );
};

export default UpdateProduct;
