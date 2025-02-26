<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="排序" prop="weigh">
        <el-input
          v-model="queryParams.weigh"
          placeholder="请输入排序"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="跳转路径" prop="url">
        <el-input
          v-model="queryParams.url"
          placeholder="请输入跳转路径"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:images:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:images:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:images:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:images:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="imagesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" :index="1" label="ID" align="center" prop="id" />
      <el-table-column label="图片地址" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview v-if="scope.row.image" :src="scope.row.image" :width="50" :height="50"/>

        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="weigh" />
      <el-table-column label="跳转路径" align="center" prop="url" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:images:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:images:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改轮播图管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="imagesRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片地址" prop="image">
          <image-upload @customUpload="handleUpload" v-model="form.image"/>
        </el-form-item>
        <el-form-item label="排序" prop="weigh">
          <el-input v-model="form.weigh" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="跳转路径" prop="url">
          <el-input v-model="form.url" placeholder="请输入跳转路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Images">
import { listImages, getImages, delImages, addImages, updateImages } from "@/api/system/images";
import {client} from '@/utils/alioss'
import { useImagesStore } from "@/store/modules/images";
const { proxy } = getCurrentInstance();

const imagesList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const imagesStore = useImagesStore();
console.log(imagesStore.images);


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    image: null,
    weigh: null,
    url: null
  },
  rules: {
    image: [
      { required: true, message: "图片地址不能为空", trigger: "blur" }
    ],
    weigh: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
    url: [
      { required: true, message: "跳转路径不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);


const file = ref([]);

const handleUpload = (url) => {
console.log(url);




form.value.image = url

};

const submit = () => {
 file.value.forEach(async item=>{

   if(item.type.split('/')[0] !== 'image'){

      proxy.$message.error('请上传图片');

    return;
}

// 生成一个唯一的文件名，使用当前时间戳



let fileName = 'img' + `${Date.parse(new Date())}` + `.${item.type.split('/')[1]}`;

try {

// 使用 ali-oss 客户端的 multipartUpload 方法上传文件

const res = await client.put("images/" + fileName, item);

// 上传成功后，打印响应结果并显示成功消息

console.log(res.url,'上传到阿里云了');
form.value.image = res.url
} catch (error) {

// 如果上传失败，打印错误信息并显示失败消息

console.error(error);

proxy.$message.error('上传失败');

}

 })



};

/** 查询轮播图管理列表 */
function getList() {
  loading.value = true;
  listImages(queryParams.value).then(response => {
    imagesList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    image: null,
    weigh: null,
    url: null
  };
  proxy.resetForm("imagesRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加轮播图管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getImages(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改轮播图管理";
  });
}

/** 提交按钮 */
function submitForm() {
  console.log('form数据',form.value);
  
  proxy.$refs["imagesRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateImages(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          submit()
          getList();
        });
      } else {
        addImages(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          submit()
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除轮播图管理编号为"' + _ids + '"的数据项？').then(function() {
    return delImages(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/images/export', {
    ...queryParams.value
  }, `images_${new Date().getTime()}.xlsx`)
}

getList();
</script>
