<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" >
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="抢购开始日期" style="width: 308px">
        <el-date-picker
          v-model="daterangeStartTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="抢购结束日期" style="width: 308px">
        <el-date-picker
          v-model="daterangeEndTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="起拍价" prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入起拍价"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否显示" prop="s" style="width: 180px">
        <el-select v-model="queryParams.s" placeholder="请选择" clearable>
          <el-option key="1" label="显示" value="1" />
          <el-option key="0" label="不显示" value="0" />
        </el-select>
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
          v-hasPermi="['system:qgood:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:qgood:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:qgood:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:qgood:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="qgoodList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" :index="1" label="ID" align="center" prop="id" width="100"/>
      <el-table-column label="商品名称" align="center" prop="name" />
      <el-table-column label="封面" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="抢购开始日期" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="抢购结束日期" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="起拍价" align="center" prop="price" >
        <template #default="scope">
          ￥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="是否显示" align="center" prop="s" width="80">
        <template #default="scope">
          <el-switch @change="isShowHandle(scope.row)" v-model="scope.row.s" active-value="1" inactive-value="0"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:qgood:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:qgood:remove']">删除</el-button>
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

    <!-- 添加或修改抢购商品管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="qgoodRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="封面" prop="image">
          <image-upload @customUpload="(url)=>handleUpload(url,'cover')" v-model="form.image" :limit="1"/>
        </el-form-item>
        <el-form-item label="详情图" prop="images">
          <image-upload @customUpload="(url)=>handleUpload(url,'album')" v-model="form.images"/>
        </el-form-item>
        <el-form-item label="抢购开始" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择抢购开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="抢购结束" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择抢购结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="起拍价" prop="price">
          <el-input v-model.number="form.price" placeholder="请输入起拍价" />
        </el-form-item>
        <el-form-item label="商品详情" prop="content">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="是否显示" prop="s">
          <el-radio-group v-model="form.s">
            <el-radio value="1">显示</el-radio>
            <el-radio value="0">隐藏</el-radio>
          </el-radio-group>
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

<script setup name="Qgood">
import { listQgood, getQgood, delQgood, addQgood, updateQgood } from "@/api/system/qgood";

const { proxy } = getCurrentInstance();

const qgoodList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeStartTime = ref([]);
const daterangeEndTime = ref([]);


const handleUpload = (url,source) => {
  console.log('积分url：',url);
  console.log('区分',source);
  if(source === 'cover'){
    form.value.image = url
  }else {
    form.value.images.push(url)
  }
};



const data = reactive({
  form: {
    images: [],
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    startTime: null,
    endTime: null,
    price: null,
    s: null
  },
  rules: {
    name: [
      { required: true, message: "商品名称不能为空", trigger: "blur" }
    ],
    image: [
      { required: true, message: "封面不能为空", trigger: "blur" }
    ],
    images: [
      { required: true, message: "商品详情图不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "抢购开始日期不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "抢购结束日期不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "起拍价不能为空", trigger: "blur" },
      { type: 'number', message: "起拍价必须是数字", trigger: "blur" }
    ],
    content: [
      { required: true, message: "商品详情不能为空", trigger: "blur" }
    ],
    s: [
      { required: true, message: "是否显示不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询抢购商品管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeStartTime && '' != daterangeStartTime) {
    queryParams.value.params["beginStartTime"] = daterangeStartTime.value[0];
    queryParams.value.params["endStartTime"] = daterangeStartTime.value[1];
  }
  if (null != daterangeEndTime && '' != daterangeEndTime) {
    queryParams.value.params["beginEndTime"] = daterangeEndTime.value[0];
    queryParams.value.params["endEndTime"] = daterangeEndTime.value[1];
  }
  listQgood(queryParams.value).then(response => {
    qgoodList.value = response.rows;
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
    name: null,
    image: null,
    images: [],
    startTime: null,
    endTime: null,
    price: null,
    content: null,
    s: null
  };
  proxy.resetForm("qgoodRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeStartTime.value = [];
  daterangeEndTime.value = [];
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
  title.value = "添加抢购商品管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getQgood(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改抢购商品管理";
  });
}

/** 提交按钮 */
function submitForm() {
  console.log('form.value',form.value);
  
  proxy.$refs["qgoodRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateQgood(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.images = form.value.images.join(',')
        addQgood(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除抢购商品管理编号为"' + _ids + '"的数据项？').then(function() {
    return delQgood(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/qgood/export', {
    ...queryParams.value
  }, `qgood_${new Date().getTime()}.xlsx`)
}

// 是否显示
const isShowHandle = async (row)=>{
  const res = await updateQgood(row);
  console.log('修改显示',res); 
}
getList();
</script>
