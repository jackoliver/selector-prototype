import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";

import {
  Input,
  Divider,
  Row,
  Col,
  Table,
  Checkbox,
  Typography,
  Layout
} from "antd";
import "antd/dist/antd.css";
import "./index.css";
import items from "./items.js";
const { Text, Title } = Typography;

const { Content, Sider } = Layout;
const { Search } = Input;

const buildCategories = products =>
  products.reduce(
    (categoriesObject, item) => ({
      ...categoriesObject,
      [item.category]: {
        id: item.categoryId,
        name: item.category,
        amount: categoriesObject[item.category]
          ? categoriesObject[item.category].amount + 1
          : 1
      }
    }),
    {}
  );

const buildBrands = products =>
  products.reduce(
    (brandsObject, item) => ({
      ...brandsObject,
      [item.brand]: {
        id: item.brandId,
        name: item.brand,
        amount: brandsObject[item.brand]
          ? brandsObject[item.brand].amount + 1
          : 1
      }
    }),
    {}
  );

const columns = [
  {
    title: "Image",
    dataIndex: "image",
    key: "image",
    fixed: "left",
    width: 80,
    render: image => (
      <img
        alt=""
        src={image}
        style={{
          maxWidth: "60px",
          maxHeight: "60px",
          margin: "0 auto",
          display: "block"
        }}
      />
    )
  },
  {
    title: "Brand",
    dataIndex: "brand",
    key: "brand",
    sortDirections: ["descend", "ascend"],
    sorter: (a, b) => a.brand.localeCompare(b.brand),
    fixed: "left",
    width: 300
  },
  {
    title: "Product",
    dataIndex: "name",
    key: "name",
    sortDirections: ["descend", "ascend"],
    sorter: (a, b) => a.name.localeCompare(b.name),
    fixed: "left",
    width: 800
  },
  {
    title: "Price From",
    dataIndex: "price",
    key: "price",
    sortDirections: ["descend", "ascend"]
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    sorter: (a, b) => a.category.localeCompare(b.category),
    fixed: "left",
    width: 300
  }
];

const rowSelection = {
  getCheckboxProps: record => ({
    name: record.name,
    id: record.id
  })
};

const filteredItems = items.filter(item => item.categoryId && item.category);
const categoriesList = buildCategories(filteredItems);
const brandsList = buildBrands(filteredItems);

const emptyObject = object => !Object.values(object).some(item => item);
const shouldFilter = (freeText, brands, categories) =>
  freeText !== null || !emptyObject(brands) || !emptyObject(categories);

const Prototype = () => {
  const [selectionType, setSelectionType] = useState("checkbox");
  const [toggles, setToggles] = useState(0);
  const [brandToggles, setBrandToggles] = useState(0);
  const [filters, setFilters] = useState({});
  const [brandFilters, setBrandFilters] = useState({});
  const [freeTextSearch, setFreeTextSearch] = useState(null);

  const toggleFilter = (checked, categoryId) => {
    //console.log({ checked, categoryId });
    setFilters({ ...filters, [categoryId]: checked });
  };

  const toggleBrandFilter = (checked, brandId) => {
    //console.log({ checked, categoryId });
    setBrandFilters({ ...brandFilters, [brandId]: checked });
  };

  const filteredData = useMemo(() => {
    return !shouldFilter(freeTextSearch, brandFilters, filters)
      ? items
      : items.filter(item => {
          if (!emptyObject(filters) && !filters[item.categoryId]) {
            return false;
          }

          if (!emptyObject(brandFilters) && !brandFilters[item.brandId]) {
            return false;
          }

          if (
            freeTextSearch &&
            !item.name.toLowerCase().includes(freeTextSearch.toLowerCase())
          ) {
            return false;
          }

          return true;
        });
  }, [filters, brandFilters, freeTextSearch]);

  const categoryCount = buildCategories(filteredData);
  const brandCount = buildBrands(filteredData);

  const RenderLitItems = ({ listItems, onSelect, context }) => {
    return Object.keys(listItems)
      .sort((a, b) => a.localeCompare(b))
      .map(name => {
        const foundItem = listItems[name];
        const filterContext = context === "categories" ? filters : brandFilters;

        let amount = 0;

        if (
          context === "categories" &&
          (categoryCount[name] && categoryCount[name].amount)
        ) {
          amount = categoryCount[name].amount;
        }

        if (
          context === "brands" &&
          (brandCount[name] && brandCount[name].amount)
        ) {
          amount = brandCount[name].amount;
        }

        return (
          <Row
            className={classNames("list-row", {
              showToggle: toggles === foundItem.id
            })}
            key={`row${foundItem.id}`}
          >
            <Col span={20}>
              <Checkbox
                checked={filterContext[foundItem.id]}
                onChange={event =>
                  onSelect(!filterContext[foundItem.id], foundItem.id)
                }
              >
                <Text
                  className={`banner ${
                    filters[foundItem.id] ? "active" : "inactive"
                  }`}
                >
                  {foundItem.name}
                </Text>
              </Checkbox>
            </Col>
            <Col span={3}>
              <Text className="amount small">{amount}</Text>
            </Col>
          </Row>
        );
      });
  };

  return (
    <div className="App">
      <section className="page-header">
        <Title level={3}>UA Standard Package</Title>
      </section>
      <Divider />
      <Layout>
        <Sider width={300}>
          <div className="search-field">
            <Search
              onSearch={value => setFreeTextSearch(value)}
              placeholder="Search"
            />
          </div>
          <Divider />
          <h4>Categories</h4>
          <div className="scroll-wrapper">
            <div className="scroll-inner">
              <RenderLitItems
                listItems={categoriesList}
                onSelect={toggleFilter}
                context="categories"
              />
            </div>
          </div>
          <Divider />
          <h4>Brands</h4>
          <div className="scroll-wrapper">
            <div className="scroll-inner">
              <RenderLitItems
                listItems={brandsList}
                onSelect={toggleBrandFilter}
                context="brands"
              />
            </div>
          </div>
          <Divider />
        </Sider>

        <Layout>
          <Content>
            <Col flex={3}>
              <Table
                rowSelection={{
                  type: selectionType,
                  ...rowSelection
                }}
                dataSource={filteredData}
                columns={columns}
                pagination={{
                  pageSize: 20,
                  simple: true
                }}
              />
            </Col>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

ReactDOM.render(<Prototype />, document.getElementById("root"));
