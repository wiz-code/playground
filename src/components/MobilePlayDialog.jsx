import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Modal,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { BasicModalBox } from './Common';
import Common from '../common.json';
import gameSlice from '../redux/gameSlice';

const { actions: gameActions } = gameSlice;
const { Games, Paths } = Common;
const gameMap = new Map(Games);

const boxStyle = (theme) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

function MobilePlayDialog({ children }) {
  const { mobilePlayDialog } = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    //

    return () => {
      //
    };
  }, []);

  const style = useMemo(() => boxStyle(theme), [theme]);

  const handleClose = useCallback((e, value) => {
    console.log(value)
    dispatch(gameActions.setMobilePlayDialog(false));
  });

  return (
    <Modal
      open={false}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Card sx={{
        maxWidth: 400,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}>
        <CardContent>
          <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: theme.spacing(1) }}>
            モバイル端末を検出しました
          </Typography>
          <Box id="modal-description">
            <Typography variant="body2">
              このゲームはモバイル端末でプレイできます。モバイル端末ではプレイ中、自身のキャラクターを端末の向きや角度によって操作可能です。
            </Typography>
            <Typography variant="body2">
              「端末の向きを設定」を押すと現在維持されている端末の角度を基準にプレイヤーの静止状態を設定します。
            </Typography>
            <Typography variant="body2">
              「PCモードでプレイ」を押すと従来の操作（マウスとキーボードを使用）でプレイできます。
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" size="small">ＰＣモードでプレイ</Button>
          <Button variant="contained" size="small">端末の向きを設定</Button>
        </CardActions>
      </Card>
    </Modal>
  );
}

MobilePlayDialog.propTypes = {
  //
};

export default MobilePlayDialog;
