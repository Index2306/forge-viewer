import React, {useCallback, useEffect, useState} from 'react';
import ModalDraggable from "@/components/ModalDraggable";
import AppButton from "@/components/Button";
import {useTranslation} from "next-i18next";
import {Col, InputNumber, Row, Slider, Space, Typography} from "antd";
import styles from '../CallPoint.module.scss';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool, updateDataExitPoint} from "@/store/slices/tool/tool.slice";
import {ExitPointDataModel} from "@/models";

const { Title } = Typography;

const CallPointModalSetting: React.FC<CallPointModalSettingProps> = ({id, name, size, isOpen, onCancel}) => {
    const {t} = useTranslation(['common', 'tool'])
    const [sizeImage, setSizeImage] = useState<number>(0.3)

    const dispatch = useAppDispatch()
    const {currentFile} = useAppSelector(selectTool)

    useEffect(() => {
        if (size) {
            setSizeImage(size)
        }

        return () => {
            setSizeImage(0.3)
        }
    }, [size, isOpen])

    // Preview the change of icon size on viewer
    const onHandlePreviewImageOnViewer = useCallback((value: number) => {
        new Promise(() => {
            // Get planeMesh on viewer by Id
            const planeMeshById = window.manualCallPointList.find((plane: any) => plane.id === id);
            if (planeMeshById && planeMeshById.planeMesh) {
                const planeMesh = planeMeshById.planeMesh;
                const planeGeometry = planeMesh.geometry;

                // Update the width and height
                const newWidth = value; // New width value
                const newHeight = value; // New height value

                // Update the attributes of the geometry
                planeGeometry.parameters.width = newWidth;
                planeGeometry.parameters.height = newHeight;

                // Perform resizing by scale (new value / old value)
                const scale = value / (size ?? 0.3);
                planeMesh.scale.x = scale;
                planeMesh.scale.y = scale;

                // Update changes to Viewer
                window.NOP_VIEWER.impl.invalidate(true, true, true);
            }
        });
    }, [id, size, window.manualCallPointList])

    // Handle change size value State
    const onChangeSizeValue = useCallback((value: number | null) => {
        if (value) {
            setSizeImage(value)
            onHandlePreviewImageOnViewer(value)
        }
    }, [onHandlePreviewImageOnViewer])

    // Handle customize symbol
    const onHandleCancelCustomizeSymbol = useCallback(() => {
        onHandlePreviewImageOnViewer(size)
        onCancel()
    }, [onCancel, onHandlePreviewImageOnViewer])

    // Change manual call point size by Id
    const onHandleCompleteCustomizeSymbol = useCallback(() => {
        const oldCallPointList = [...(currentFile?.fileData?.exitPoints ?? [])]
        const findDataCustomizeIndex = oldCallPointList.findIndex((callPoint: ExitPointDataModel) => callPoint.id === id);
        if (findDataCustomizeIndex > -1) {
            const oldData = oldCallPointList[findDataCustomizeIndex];
            oldCallPointList[findDataCustomizeIndex] = {
                ...oldData,
                size: sizeImage,
                isManual: true
            }
            dispatch(updateDataExitPoint(oldCallPointList))
        }

    }, [dispatch, sizeImage, id, currentFile?.fileData?.exitPoints])

    // Do apply to all "Manual call point" in the list
    const onHandleApplyToAllSymbol = useCallback(() => {
        const newCallPointList = [...(currentFile?.fileData?.exitPoints ?? [])].map((callPoint: ExitPointDataModel) => ({
            ...callPoint,
            size: sizeImage,
            isManual: true
        }))
        dispatch(updateDataExitPoint(newCallPointList))
    }, [dispatch, sizeImage, currentFile?.fileData?.exitPoints])

    return (
        <ModalDraggable
            // renderTitle={<Title level={4}>{name}</Title>}
            title={name}
            open={isOpen}
            onCancel={onHandleCancelCustomizeSymbol}
            renderFooter={
                <Space>
                    <AppButton type={'ghost'} onClick={onHandleCancelCustomizeSymbol}>{t('cancel')}</AppButton>
                    <AppButton onClick={onHandleCompleteCustomizeSymbol}>{t('complete')}</AppButton>
                    <AppButton onClick={onHandleApplyToAllSymbol} type={'warning'}>{t('apply_to_all')}</AppButton>
                </Space>
            }
            width={500}
            mask={false}
            maskClosable
        >
            <div className={styles.changeSizeForm}>
                <Title level={5}>{t('customize_symbol_size', {ns: 'tool'})}:</Title>
                <div className={styles.previewSlider}>
                    <Row style={{width: '80%'}}>
                        <Col span={20}>
                            <Slider
                                min={0}
                                max={1}
                                onChange={onChangeSizeValue}
                                value={sizeImage}
                                step={0.01}
                            />
                        </Col>
                        <Col span={4}>
                            <InputNumber
                                min={0}
                                max={1}
                                style={{margin: '0 16px'}}
                                value={sizeImage}
                                onChange={onChangeSizeValue}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        </ModalDraggable>
    );
};

export default React.memo(CallPointModalSetting);

interface CallPointModalSettingProps {
    id: string,
    name: string | undefined
    size: number
    isOpen: boolean
    onCancel: () => void
}